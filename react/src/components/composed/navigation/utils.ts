import type { TTocItem } from "./types"

const flatMapNestedNodes = (item: TTocItem): TTocItem[] =>
  item.nodes?.flatMap((node) => [node, ...flatMapNestedNodes(node)]) ?? []

const flatMapCollectionNodes = (items: readonly TTocItem[]): TTocItem[] =>
  items.flatMap((item) => [item, ...flatMapNestedNodes(item)])

export function hasSectionWithNestedNodes(
  items: readonly TTocItem[]
): boolean {
  return items.some(
    (item) => item.type === "section" && flatMapNestedNodes(item).length > 4
  )
}

export function isBibleOrQuranCollection(
  items: readonly TTocItem[]
): boolean {
  const types = new Set(flatMapCollectionNodes(items).map((item) => item.type))

  return (
    types.has("verse") &&
    (types.has("chapter") || types.has("surah") || types.has("book"))
  )
}