import type {
  CorpusAnchor,
  CorpusData,
  CorpusNode,
  CorpusSearchResult,
} from "./types"

export function sameAnchor(
  a: CorpusAnchor | null,
  b: CorpusAnchor | null
): boolean {
  return (
    a === b ||
    (!!a &&
      !!b &&
      a.corpusId === b.corpusId &&
      a.editionId === b.editionId &&
      a.nodeId === b.nodeId)
  )
}
export function anchorFor(data: CorpusData, nodeId: string): CorpusAnchor {
  return { corpusId: data.corpusId, editionId: data.editionId, nodeId }
}
export function scopeKey(data: CorpusData): string {
  return JSON.stringify([data.corpusId, data.editionId])
}
export interface CorpusIndexEntry {
  node: CorpusNode
  path: readonly CorpusNode[]
}
const indices = new WeakMap<CorpusData, ReadonlyMap<string, CorpusIndexEntry>>()
/** Validates stable IDs and increasing schema depth, retaining host ordering. */
export function indexCorpus(
  data: CorpusData
): ReadonlyMap<string, CorpusIndexEntry> {
  const cached = indices.get(data)
  if (cached) return cached
  const index = new Map<string, CorpusIndexEntry>()
  const levels = data.schema.levels.map((level) => level.id)
  if (new Set(levels).size !== levels.length)
    throw new Error("Schema level IDs must be unique")
  function visit(
    nodes: readonly CorpusNode[],
    path: readonly CorpusNode[],
    depth: number
  ) {
    for (const node of nodes) {
      const next = levels.indexOf(node.level)
      if (index.has(node.id)) throw new Error(`Duplicate node ID: ${node.id}`)
      if (next <= depth || next < 0)
        throw new Error(`Invalid schema level: ${node.level}`)
      if (
        data.schema.levels
          .slice(depth + 1, next)
          .some((level) => !level.optional)
      )
        throw new Error(`Missing required level before ${node.id}`)
      const entry = { node, path: [...path, node] }
      index.set(node.id, entry)
      visit(node.children ?? [], entry.path, next)
    }
  }
  visit(data.nodes, [], -1)
  indices.set(data, index)
  return index
}
export function validAnchor(
  data: CorpusData,
  anchor: CorpusAnchor | null
): anchor is CorpusAnchor {
  if (
    !anchor ||
    anchor.corpusId !== data.corpusId ||
    anchor.editionId !== data.editionId
  )
    return false
  const entry = indexCorpus(data).get(anchor.nodeId)
  return !!entry && !entry.path.some((node) => node.disabled)
}
export function formatReference(
  data: CorpusData,
  anchor: CorpusAnchor | null
): string {
  if (!validAnchor(data, anchor)) return "Choose location"
  return indexCorpus(data)
    .get(anchor.nodeId)!
    .path.map((node) => node.label)
    .join(" › ")
}
const normalize = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase()
    .replace(/[:.,/›]+/g, " ")
    .replace(/\s+/g, " ")
/** Exact aliases/tokens only; never guesses canon bounds or clamps bad references. */
export function referenceResults(
  data: CorpusData,
  query: string
): CorpusSearchResult[] {
  const input = normalize(query)
  if (!input) return []
  const found: CorpusSearchResult[] = []
  for (const { node, path } of indexCorpus(data).values()) {
    if (path.some((part) => part.disabled)) continue
    const matches = (position: number, rest: string): boolean => {
      if (position === path.length) return rest === ""
      const part = path[position]
      const level = data.schema.levels.find((level) => level.id === part.level)!
      const names = [
        part.label,
        part.reference,
        ...(part.aliases ?? []),
        part.reference ? `${level.label} ${part.reference}` : undefined,
      ].filter((name): name is string => !!name)
      return names.some((name) => {
        const token = normalize(name)
        return rest === token
          ? matches(position + 1, "")
          : rest.startsWith(token + " ") &&
              matches(position + 1, rest.slice(token.length + 1))
      })
    }
    if (matches(0, input))
      found.push({
        anchor: anchorFor(data, node.id),
        label: formatReference(data, anchorFor(data, node.id)),
        kind: "reference",
      })
    if (found.length === 20) break
  }
  return found
}
export function adjacentAnchor(
  data: CorpusData,
  anchor: CorpusAnchor | null,
  offset: -1 | 1
): CorpusAnchor | undefined {
  if (!validAnchor(data, anchor)) return
  const entry = indexCorpus(data).get(anchor.nodeId)!
  const siblings = (entry.path.at(-2)?.children ?? data.nodes).filter(
    (node) => node.level === entry.node.level && !node.disabled
  )
  const next =
    siblings[siblings.findIndex((node) => node.id === anchor.nodeId) + offset]
  return next ? anchorFor(data, next.id) : undefined
}
