// Simplify the generated Corpora file-icon components (idempotent — safe to
// re-run after regenerating from Sketch, see src/components/icons/README.md).
// Run it on freshly generated files BEFORE any prettier pass:
//
// - layer switching via Tailwind's `dark` variant instead of inline CSS
// - xlinkHref -> href, drop xmlnsXlink
// - drop dead defs (Sketch's path-1 referenced only from a bogus href on <g>,
//   unused fallback glyphs), unreferenced ids, doubled id prefixes,
//   zero-length curve segments, default-value attributes
// - dedupe defs that are content-identical across (or within) the light and
//   dark layers: a <defs> entry resolves from either layer, hidden or not
// - verify every url(#…)/href="#…" reference still resolves
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/components/icons"
)

/** Balanced element block starting at `start` (index of `<tag`). */
function balancedBlock(src, start, tag) {
  let i = start
  let depth = 0
  while (i < src.length) {
    const nextOpen = src.indexOf(`<${tag}`, i)
    const nextClose = src.indexOf(`</${tag}>`, i)
    if (nextClose === -1) throw new Error(`unbalanced <${tag}> at ${start}`)
    if (nextOpen !== -1 && nextOpen < nextClose) {
      const gt = src.indexOf(">", nextOpen)
      if (src[gt - 1] !== "/") depth++
      i = gt + 1
    } else {
      depth--
      i = nextClose + tag.length + 3
      if (depth === 0) return { start, end: i, text: src.slice(start, i) }
    }
  }
  throw new Error(`unbalanced <${tag}> at ${start}`)
}

/** Top-level children of the <defs> block at `defsStart`, in file coords. */
function defsChildren(src, defsStart) {
  const defs = balancedBlock(src, defsStart, "defs")
  const from = src.indexOf(">", defsStart) + 1
  const to = defs.end - "</defs>".length
  const children = []
  let i = from
  while (i < to) {
    const lt = src.indexOf("<", i)
    if (lt === -1 || lt >= to) break
    const tag = /^<([a-zA-Z]+)/.exec(src.slice(lt, lt + 30))?.[1]
    if (!tag) {
      i = lt + 1
      continue
    }
    const gt = src.indexOf(">", lt)
    if (src[gt - 1] === "/") {
      children.push({
        start: lt,
        end: gt + 1,
        text: src.slice(lt, gt + 1),
        tag,
      })
      i = gt + 1
    } else {
      const block = balancedBlock(src, lt, tag)
      children.push({ ...block, tag })
      i = block.end
    }
  }
  return children
}

const ids = (s) => [...s.matchAll(/id="([^"]+)"/g)].map((m) => m[1])
const refsIn = (s) =>
  new Set([
    ...[...s.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]),
    ...[...s.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]),
  ])

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".tsx"))) {
  const path = join(DIR, file)
  let src = readFileSync(path, "utf8")
  const before = src.length

  // --- theming: Tailwind layer classes instead of inline CSS ---------------
  src = src.replace(
    /import \{ FILE_ICON_CLASS, FILE_ICON_THEME_CSS \} from '\.\/theme';\n/,
    ""
  )
  src = src.replace(
    /className=\{className \? `\$\{FILE_ICON_CLASS\} \$\{className\}` : FILE_ICON_CLASS\}/,
    "className={className}"
  )
  src = src.replace(/\s*<style>\{FILE_ICON_THEME_CSS\}<\/style>/, "")
  src = src.replace(
    /<g data-theme-layer="light">/,
    '<g data-theme-layer="light" className="dark:hidden">'
  )
  src = src.replace(
    /<g data-theme-layer="dark">/,
    '<g data-theme-layer="dark" className="hidden dark:inline">'
  )
  src = src.replace(
    /Switches between light and dark artwork automatically\. See `\.\/theme\.ts`\./,
    "Light/dark artwork layers switch on Tailwind's `dark` variant."
  )

  // --- modern hrefs --------------------------------------------------------
  src = src.replaceAll("xlinkHref", "href")
  src = src.replace(/\s*xmlnsXlink="http:\/\/www\.w3\.org\/1999\/xlink"/, "")
  // href on <g> is meaningless (only <use> takes it) — Sketch artifact.
  src = src.replace(/(<g\b[^>]*?) href="#[^"]*"/g, "$1")

  // --- doubled id prefixes (tei-badge-l-tei-badge-l-…) ---------------------
  src = src.replace(/([a-z0-9]+-(?:badge|wordmark)-[ld]-)\1/g, "$1")

  // --- zero-length curve segments (C p p p following point p) --------------
  src = src.replace(/(-?[\d.]+,-?[\d.]+) C\1 \1 \1/g, "$1")

  // --- default-value attributes (no strokes anywhere: stroke="none") -------
  src = src.replace(/ fillOpacity="1"/g, "")
  src = src.replace(/ strokeWidth="1"/g, "")

  // --- dedupe content-identical defs ---------------------------------------
  const base = /id="([a-z0-9]+-(?:badge|wordmark))-[ld]-/.exec(src)?.[1]
  if (!base) throw new Error(`${file}: cannot find id prefix`)
  const P_L = `${base}-l-`
  const P_D = `${base}-d-`
  const rootId = (t) => /^<[a-zA-Z]+[^>]*? id="([^"]+)"/.exec(t)?.[1]
  // Root id stripped, layer prefixes normalized, and all whitespace collapsed
  // so a prettier pass can never make identical defs look different (or,
  // worse, different defs look identical — the id/ref structure is part of
  // the comparison, so distinct filters always stay distinct).
  const normalize = (t) => {
    const id = rootId(t)
    const n = id ? t.replace(` id="${id}"`, "") : t
    return n.replaceAll(P_L, "§").replaceAll(P_D, "§").replace(/\s+/g, " ")
  }

  // Only each layer's top-level <defs> — nested glyph defs travel inside
  // their text group.
  const topDefs = [...src.matchAll(/<defs>/g)]
    .map((m) => m.index)
    .filter((s) => /data-theme-layer/.test(src.slice(Math.max(0, s - 300), s)))

  const keepByNorm = new Map()
  const idMap = new Map()
  const drops = []
  for (const defsStart of topDefs) {
    for (const child of defsChildren(src, defsStart)) {
      if (!rootId(child.text)) continue
      const norm = normalize(child.text)
      const kept = keepByNorm.get(norm)
      if (kept === undefined) {
        keepByNorm.set(norm, child)
      } else {
        const dIds = ids(child.text)
        const kIds = ids(kept.text)
        if (dIds.length !== kIds.length) continue
        dIds.forEach((d, k) => idMap.set(d, kIds[k]))
        drops.push(child)
      }
    }
  }
  for (const child of drops.sort((a, b) => b.start - a.start)) {
    src = src.slice(0, child.start) + src.slice(child.end)
  }
  for (const [d] of idMap) {
    let target = idMap.get(d)
    while (idMap.has(target)) target = idMap.get(target)
    src = src
      .replaceAll(`url(#${d})`, `url(#${target})`)
      .replaceAll(`href="#${d}"`, `href="#${target}"`)
  }

  // --- dead defs and unreferenced ids (to fixpoint) ------------------------
  for (let pass = 0; pass < 6; pass++) {
    const refs = refsIn(src)
    let changed = false
    for (const defsStart of [...src.matchAll(/<defs>/g)]
      .map((m) => m.index)
      .reverse()) {
      for (const child of defsChildren(src, defsStart).sort(
        (a, b) => b.start - a.start
      )) {
        const childIds = ids(child.text)
        if (childIds.length === 0) continue // anonymous wrapper, keep
        if (!childIds.some((i) => refs.has(i))) {
          src = src.slice(0, child.start) + src.slice(child.end)
          changed = true
        }
      }
    }
    // Unreferenced glyph groups nested inside a referenced text group.
    for (const m of [
      ...src.matchAll(/<g id="([^"]+glyph[^"]+)">/g),
    ].reverse()) {
      if (!refs.has(m[1])) {
        const block = balancedBlock(src, m.index, "g")
        src = src.slice(0, block.start) + src.slice(block.end)
        changed = true
      }
    }
    src = src.replace(/ id="([^"]+)"/g, (whole, id) =>
      refs.has(id) ? whole : ""
    )
    if (!changed) break
  }

  // --- tidy whitespace left behind by removals -----------------------------
  let prev
  do {
    prev = src
    src = src.replace(/\n[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
  } while (src !== prev)

  // --- validate ------------------------------------------------------------
  const finalIds = new Set(ids(src))
  const missing = [...refsIn(src)].filter((r) => !finalIds.has(r))
  if (missing.length)
    throw new Error(`${file}: dangling refs ${missing.join(", ")}`)
  if (src.includes("FILE_ICON"))
    throw new Error(`${file}: theme import survived`)

  writeFileSync(path, src)
  const delta =
    before === src.length ? "unchanged" : `${before} -> ${src.length} bytes`
  console.log(`${file}: ${delta}`)
}
