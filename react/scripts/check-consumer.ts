import assert from "node:assert/strict"
import { cp, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

// Install the actual tarball outside the workspace so hoisted dev dependencies
// cannot accidentally make a broken published package pass.
const root = path.resolve(import.meta.dirname, "..")
const scratch = await mkdtemp(path.join(tmpdir(), "corpora-ui-consumer-"))
const archive = path.join(scratch, "corpora-ui.tgz")
const app = path.join(scratch, "app")

async function run(command: string[], cwd: string): Promise<string> {
  const child = Bun.spawn(command, { cwd, stdout: "pipe", stderr: "inherit" })
  const output = await new Response(child.stdout).text()
  const exitCode = await child.exited
  if (output.trim()) process.stdout.write(output)
  assert.equal(exitCode, 0, `${command.join(" ")} failed in ${cwd}`)
  return output
}

try {
  await run(
    ["bun", "pm", "pack", "--filename", archive, "--ignore-scripts", "--quiet"],
    root
  )
  const listing = Bun.spawn(["tar", "-tzf", archive], {
    stdout: "pipe",
    stderr: "inherit",
  })
  const entries = (await new Response(listing.stdout).text()).trim().split("\n")
  assert.equal(await listing.exited, 0)
  for (const entry of entries) {
    assert(
      !/(^|\/)(src|node_modules|examples|stories|__tests__|docs)(\/|$)/.test(
        entry
      ),
      `Unexpected package entry: ${entry}`
    )
    assert(
      !/\.(test\.|map$)/.test(entry),
      `Unexpected test or source map: ${entry}`
    )
  }
  await run(["tar", "-xzf", archive, "-C", scratch], root)
  const packedRoot = path.join(scratch, "package")
  const packed = JSON.parse(
    await readFile(path.join(packedRoot, "package.json"), "utf8")
  )
  for (const section of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const version of Object.values(packed[section] ?? {})) {
      assert(
        typeof version === "string" &&
          !/^(catalog|workspace|file):/.test(version),
        `Unresolved ${section} protocol: ${version}`
      )
    }
  }
  for (const exported of Object.values(packed.exports)) {
    const targets =
      typeof exported === "string"
        ? [exported]
        : Object.values(exported as Record<string, string>)
    for (const target of targets)
      assert(
        (await stat(path.join(packedRoot, target))).isFile(),
        `Missing export: ${target}`
      )
  }
  const css = await readFile(
    path.join(packedRoot, "dist-lib/index.css"),
    "utf8"
  )
  assert(
    css.length > 0 && !/@(?:import|source|plugin|apply|theme)\b/.test(css),
    "CSS must be compiled and self-contained"
  )
  // Shell, Scaffold, and Bubble must work without a consumer Tailwind plugin.
  const bezelClasses = [
    "bezel-lit-t-2", "bezel-dim-b-2", "bezel-dim-blur-3",
    "bezel-lit-blur-2", "bezel-lit-blur-3",
    "bezel-lit/14", "bezel-lit/57", "bezel-dim/11", "bezel-dim/78",
    "dark:bezel-lit-blur-2", "dark:bezel-lit-blur-3",
    "dark:bezel-lit/14", "dark:bezel-lit/57",
    "dark:bezel-dim/11", "dark:bezel-dim/78",
  ]
  for (const className of bezelClasses) {
    const selector = `.${className.replace(/[\\:/]/g, "\\$&")}${
      className.startsWith("dark:") ? ":is(.dark *)" : ""
    }`
    const ruleStart = css.indexOf(`${selector}{`)
    const declarations = ruleStart < 0 ? "" : css.slice(
      ruleStart + selector.length + 1, css.indexOf("}", ruleStart)
    )
    assert(
      declarations.includes("box-shadow:var(--tw-bezel-shadow)"),
      `Missing compiled Specular utility: ${className}`
    )
  }
  assert(
    css.includes("--tw-bezel-shadow:inset "),
    "Missing Specular base shadow definition"
  )
  assert(
    entries.includes("package/dist-lib/BEAUTIFUL-UI-LICENSE.txt"),
    "Missing third-party notice"
  )
  assert(
    entries.includes("package/dist-lib/EVILCHARTS-LICENSE.txt"),
    "Missing EvilCharts notice"
  )

  const example = path.join(root, "examples/consumer")
  for (const file of [
    "src",
    "index.html",
    "tsconfig.json",
    "vite.config.ts",
    "package.json",
  ]) {
    await cp(path.join(example, file), path.join(app, file), {
      recursive: true,
    })
  }
  const manifest = JSON.parse(
    await readFile(path.join(app, "package.json"), "utf8")
  )
  const workspace = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8")
  )
  for (const section of ["dependencies", "devDependencies"]) {
    for (const [name, version] of Object.entries(manifest[section])) {
      if (version === "catalog:") {
        assert(workspace.catalog[name], `Missing catalog entry: ${name}`)
        manifest[section][name] = workspace.catalog[name]
      }
    }
  }
  manifest.dependencies[packed.name] = `file:${archive}`
  await writeFile(
    path.join(app, "package.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  )
  await run(["bun", "install", "--ignore-scripts"], app)
  await run(["bun", "run", "build"], app)
  await run([
    "bun", "-e", `
      import assert from "node:assert/strict";
      const root = await import("@exegia/corpora-ui");
      for (const entry of ["button", "card", "input", "label", "state", "overlays", "shell", "scaffold"]) {
        const focused = await import("@exegia/corpora-ui/" + entry);
        for (const [name, value] of Object.entries(focused)) {
          const rootName = entry === "shell" && name === "default" ? "ShellLayout" : name;
          assert.strictEqual(root[rootName], value, entry + ": duplicate or missing " + name);
        }
      }
      console.log("Root/subpath exports share components, provider, and store.");
    `,
  ], app)
  await cp(
    path.join(root, "scripts/check-consumer-bundle.ts"),
    path.join(app, "check-consumer-bundle.ts")
  )
  await run(["bun", "check-consumer-bundle.ts"], app)
  console.log(
    `Consumer passed: ${entries.length} package entries; compiled CSS with Specular light/dark utilities; catalog versions resolved; isolated TypeScript + production build.`
  )
  if (process.env.KEEP_CONSUMER_FIXTURE === "1") {
    console.log(`Consumer fixture retained at ${app}`)
  } else {
    await rm(scratch, { recursive: true, force: true })
  }
} catch (error) {
  console.error(`Consumer check failed. Inspect ${scratch}`)
  throw error
}
