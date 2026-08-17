import type { TreeNode } from "./type"

/** Depth-0 nodes read as sections only when the data actually nests three
 * levels — a two-level tree keeps its top level as plain link rows. */
export function hasThreeLevels(items: readonly TreeNode[]): boolean {
  return items.some((node) =>
    node.children?.some((child) => (child.children?.length ?? 0) > 0)
  )
}

/** Ids of every ancestor of `id` (nearest last); empty when absent. */
export function ancestorIdsOf(
  items: readonly TreeNode[],
  id: string
): string[] {
  const walk = (nodes: readonly TreeNode[], trail: string[]): string[] | null => {
    for (const node of nodes) {
      if (node.id === id) return trail
      if (node.children) {
        const found = walk(node.children, [...trail, node.id])
        if (found) return found
      }
    }
    return null
  }
  return walk(items, []) ?? []
}

/** Ids that start expanded: `defaultOpen` nodes plus every ancestor of the
 * active entry, so the current location is never folded away. */
export function initialExpandedIds(
  items: readonly TreeNode[],
  activeId?: string
): Set<string> {
  const expanded = new Set<string>()
  const walk = (nodes: readonly TreeNode[]) => {
    for (const node of nodes) {
      if (node.defaultOpen) expanded.add(node.id)
      if (node.children) walk(node.children)
    }
  }
  walk(items)
  if (activeId !== undefined)
    for (const id of ancestorIdsOf(items, activeId)) expanded.add(id)
  return expanded
}

/** Ids of every node that can hold children — the set `expandAll` opens.
 * In `files` an empty `children: []` still counts (it is a folder). */
export function expandableIdsOf(
  items: readonly TreeNode[],
  filesVariant = false
): string[] {
  const ids: string[] = []
  const walk = (nodes: readonly TreeNode[]) => {
    for (const node of nodes) {
      const branch = filesVariant
        ? node.children !== undefined
        : (node.children?.length ?? 0) > 0
      if (branch) ids.push(node.id)
      if (node.children) walk(node.children)
    }
  }
  walk(items)
  return ids
}

/** Immutably relabel `id`. Returns the same array reference when absent. */
export function renameNode(
  items: readonly TreeNode[],
  id: string,
  label: string
): TreeNode[] {
  return items.map((node) => {
    if (node.id === id) return { ...node, label }
    return node.children
      ? { ...node, children: renameNode(node.children, id, label) }
      : node
  })
}

/** Whether `candidateId` is `id` itself or nests anywhere under it — the
 * guard that keeps a folder from being dropped into its own subtree. */
export function containsNode(
  items: readonly TreeNode[],
  id: string,
  candidateId: string
): boolean {
  if (id === candidateId) return true
  const root = findNode(items, id)
  if (!root?.children) return false
  return findNode(root.children, candidateId) !== null
}

export function findNode(
  items: readonly TreeNode[],
  id: string
): TreeNode | null {
  for (const node of items) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

/** Parent id (`null` at root) and index of `id` among its siblings. */
export function locateNode(
  items: readonly TreeNode[],
  id: string
): { parentId: string | null; index: number } | null {
  const walk = (
    nodes: readonly TreeNode[],
    parentId: string | null
  ): { parentId: string | null; index: number } | null => {
    for (const [index, node] of nodes.entries()) {
      if (node.id === id) return { parentId, index }
      if (node.children) {
        const found = walk(node.children, node.id)
        if (found) return found
      }
    }
    return null
  }
  return walk(items, null)
}

/** Immutably lift `id` out of the tree and reinsert it under `parentId`
 * (`null` = root) at `index` — the standard `onMove` reducer, exported so
 * consumers don't each rebuild it. `index` addresses the sibling list
 * *after* the node has been lifted out. */
export function moveNode(
  items: readonly TreeNode[],
  id: string,
  parentId: string | null,
  index: number
): TreeNode[] {
  // Dropping into the node's own subtree would orphan it — refuse.
  if (parentId !== null && containsNode(items, id, parentId)) return [...items]
  let moved: TreeNode | null = null
  const strip = (nodes: readonly TreeNode[]): TreeNode[] =>
    nodes.flatMap((node) => {
      if (node.id === id) {
        moved = node
        return []
      }
      return node.children
        ? [{ ...node, children: strip(node.children) }]
        : [node]
    })
  const stripped = strip(items)
  if (!moved) return [...items]
  const captured = moved as TreeNode

  if (parentId === null) {
    const next = [...stripped]
    next.splice(Math.min(index, next.length), 0, captured)
    return next
  }
  const insert = (nodes: readonly TreeNode[]): TreeNode[] =>
    nodes.map((node) => {
      if (node.id === parentId) {
        const children = [...(node.children ?? [])]
        children.splice(Math.min(index, children.length), 0, captured)
        return { ...node, children }
      }
      return node.children ? { ...node, children: insert(node.children) } : node
    })
  return insert(stripped)
}
