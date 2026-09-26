import assert from "node:assert/strict"
import { gzipSync } from "node:zlib"
import { build, type Plugin } from "vite"

// Copied into the isolated consumer: resolve Vite and all dependencies there.
const forbidden = /\/node_modules\/(?:.*\/node_modules\/)?(?:frimousse|morphicons|motion-icons-react)\//
const layoutMotion = /\/node_modules\/(?:.*\/node_modules\/)?(?:motion-dom|framer-motion)\//

async function measure(rootImports: boolean) {
  let bytes = 0
  let gzip = 0
  let initialBytes = 0
  let initialGzip = 0
  const retained = new Set<string>()
  const initiallyRetained = new Set<string>()
  const audit: Plugin = {
    name: "consumer-bundle-contract",
    enforce: "pre",
    transform(code, id) {
      if (rootImports && /\/src\/(App|main|ReadingWorkspace)\.tsx$/.test(id)) {
        return code.replace(
          /@exegia\/corpora-ui\/(button|card|input|label|state|overlays|shell|scaffold)(?=["'])/g,
          "@exegia/corpora-ui"
        )
      }
    },
    generateBundle(_options, bundle) {
      const initial = new Set<string>()
      function visit(file: string) {
        if (initial.has(file)) return
        const output = bundle[file]
        if (output?.type !== "chunk") return
        initial.add(file)
        for (const imported of output.imports) visit(imported)
      }
      for (const output of Object.values(bundle)) {
        if (output.type === "chunk" && output.isEntry) visit(output.fileName)
      }
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue
        bytes += Buffer.byteLength(output.code)
        gzip += gzipSync(output.code).byteLength
        if (initial.has(output.fileName)) {
          initialBytes += Buffer.byteLength(output.code)
          initialGzip += gzipSync(output.code).byteLength
        }
        for (const [id, module] of Object.entries(output.modules)) {
          if (module.renderedLength > 0) {
            retained.add(id)
            if (initial.has(output.fileName)) initiallyRetained.add(id)
          }
        }
      }
    },
  }
  await build({
    root: import.meta.dirname,
    plugins: [audit],
    logLevel: "warn",
    build: { write: false },
  })
  return { bytes, gzip, initialBytes, initialGzip, retained, initiallyRetained }
}

const focused = await measure(false)
const root = await measure(true)
assert(focused.bytes > 0, "Consumer bundle is empty")
for (const id of focused.retained) {
  assert(!forbidden.test(id), `Unrelated dependency retained: ${id}`)
}
const glass = /\/node_modules\/@samasante\/liquid-glass\//
const sound = /\/node_modules\/cuelume\//
assert([...focused.retained].some((id) => glass.test(id)), "Missing optional glass chunk")
assert([...focused.retained].some((id) => sound.test(id)), "Missing optional sound chunk")
for (const graph of [focused, root]) {
  for (const id of graph.initiallyRetained) {
    assert(!layoutMotion.test(id), `Layout motion loaded before opening the workspace: ${id}`)
    assert(!glass.test(id), `Glass implementation loaded at startup: ${id}`)
    assert(!sound.test(id), `Sound implementation loaded at startup: ${id}`)
  }
}
// Equivalent import graphs can reorder minified identifiers and gzip blocks.
// Allow 1 KiB of encoding variance while still rejecting added startup code.
assert(
  focused.initialBytes <= root.initialBytes + 1024 &&
    focused.initialGzip <= root.initialGzip + 1024,
  "Focused startup exceeds the root bundle beyond encoding variance"
)
console.log(
  `Bundle contract passed: focused startup ${focused.initialBytes} bytes (${focused.initialGzip} gzip), total ${focused.bytes} (${focused.gzip} gzip); root startup ${root.initialBytes} (${root.initialGzip} gzip), total ${root.bytes} (${root.gzip} gzip).`
)
