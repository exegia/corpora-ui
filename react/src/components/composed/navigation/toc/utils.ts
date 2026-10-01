import { isValidElement, type ReactNode } from "react"
import type { TTocItem, TTocTreeNode } from "./types"

const flatMapNestedNodes = (item: TTocItem): TTocItem[] =>
  item.nodes?.flatMap((node) => [node, ...flatMapNestedNodes(node)]) ?? []

const flatMapCollectionNodes = (items: readonly TTocItem[]): TTocItem[] =>
  items.flatMap((item) => [item, ...flatMapNestedNodes(item)])

export function hasSectionWithNestedNodes(items: readonly TTocItem[]): boolean {
  return items.some(
    (item) => item.type === "section" && flatMapNestedNodes(item).length > 4
  )
}

export function isBibleOrQuranCollection(items: readonly TTocItem[]): boolean {
  const types = new Set(flatMapCollectionNodes(items).map((item) => item.type))

  return (
    types.has("verse") &&
    (types.has("chapter") || types.has("surah") || types.has("book"))
  )
}

export const getLabelText = (label: ReactNode, fallback: string): string => {
  if (typeof label === "string" || typeof label === "number")
    return String(label)

  if (Array.isArray(label)) {
    const text = label
      .map((child) => getLabelText(child, ""))
      .join("")
      .trim()
    return text || fallback
  }
  if (isValidElement<{ children?: ReactNode }>(label))
    return getLabelText(label.props.children, fallback)
  return fallback
}

export const mapItemsToTreeNodes = (
  items: readonly TTocItem[]
): TTocTreeNode[] =>
  items.map((item) => ({
    id: item.id,
    name: getLabelText(item.label, item.id),
    href: item.link,
    item,
    children: item.nodes ? mapItemsToTreeNodes(item.nodes) : undefined,
  }))

/** Keep ancestors of matching rows; a matching branch keeps its descendants. */
export function filterTocNodes(nodes: TTocTreeNode[], query: string): TTocTreeNode[] {
  const term = query.trim().toLocaleLowerCase()
  if (!term) return nodes
  return nodes.flatMap((node) => {
    if (node.name.toLocaleLowerCase().includes(term)) return [node]
    const children = node.children ? filterTocNodes(node.children, term) : []
    return children.length ? [{ ...node, children }] : []
  })
}

export function tocBranchIds(nodes: TTocTreeNode[]): string[] {
  return nodes.flatMap((node) => node.children?.length
    ? [node.id, ...tocBranchIds(node.children)]
    : [])
}
