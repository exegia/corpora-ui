import { expect, test } from "bun:test"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const contentRoot = resolve(appRoot, "content")

for (const file of readdirSync(contentRoot, { recursive: true }).filter(
  (file) => /\.mdx?$/.test(String(file))
)) {
  test(`docs imports resolve: ${file}`, () => {
    // Ignore usage snippets: only imports executed by the MDX page count.
    const source = readFileSync(
      resolve(contentRoot, String(file)),
      "utf8"
    ).replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "")
    const imports = [
      ...source.matchAll(/^import\s+[\s\S]*?\sfrom\s+["'](@\/[^"']+)["']/gm),
    ]
    for (const [, specifier] of imports) {
      const target = resolve(appRoot, "src", specifier!.slice(2))
      const found = [
        "",
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        "/index.ts",
        "/index.tsx",
      ].some((suffix) => existsSync(target + suffix))
      expect(found, `${file} imports missing module ${specifier}`).toBe(true)
    }
  })
}
