"use client"

import * as React from "react"

import { playCue } from "@/lib/sound"
import type { TreeController, TreeNode, UseTreeOptions } from "./type"
import { useTreeDnd } from "./use-tree-dnd"
import {
  ancestorIdsOf,
  expandableIdsOf,
  findNode,
  hasThreeLevels,
  initialExpandedIds,
  moveNode,
  renameNode,
} from "./utils"

/**
 * The tree's headless controller — every behaviour the component exposes,
 * callable from outside it: expand/collapse (a node, a section, the whole
 * tree), fold the `sidebar` rail, select a node, rename, reorder.
 *
 * Each piece of state is controlled-or-uncontrolled in the usual React
 * shape: pass `items`/`activeId`/`collapsed` to own it yourself, or
 * `defaultItems`/`defaultActiveId`/`defaultCollapsed` to let the hook. When
 * the hook owns `items` (or you pass `onItemsChange`), `rename` and `move`
 * apply the edit to the data themselves — otherwise they only report it
 * through `onRename`/`onMove` and you reduce the tree yourself.
 *
 * ```tsx
 * const tree = useTree({ variant: "files", defaultItems: files })
 * <Tree tree={tree} />
 * <Button onClick={tree.collapseAll}>Collapse all</Button>
 * ```
 */
export function useTree(options: UseTreeOptions): TreeController {
  const {
    variant,
    onNavigate,
    onRename,
    onMove,
    onItemsChange,
    onExpandedChange,
    onCollapsedChange,
    sound = true,
  } = options

  // Data: controlled through `items`, otherwise owned here.
  const [ownItems, setOwnItems] = React.useState<TreeNode[]>(
    () => options.defaultItems ?? []
  )
  const items = options.items ?? ownItems
  // The hook may only rewrite the data when it owns it, or when the
  // consumer asked for the next tree through `onItemsChange`.
  const managesItems =
    options.items === undefined || onItemsChange !== undefined

  const setItems = React.useCallback(
    (next: TreeNode[]) => {
      if (options.items === undefined) setOwnItems(next)
      onItemsChange?.(next)
    },
    [options.items, onItemsChange]
  )

  const sectioned = variant === "navigation" && hasThreeLevels(items)

  // Selection: controlled through `activeId`, otherwise owned here.
  const [ownActiveId, setOwnActiveId] = React.useState(options.defaultActiveId)
  const activeId = options.activeId ?? ownActiveId

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => {
    const expanded = options.defaultExpandedIds
      ? new Set(options.defaultExpandedIds)
      : initialExpandedIds(items, activeId)
    // Section names default open — they are headings over their run of
    // items, not drawers; `defaultOpen: false` still starts one closed.
    if (sectioned && !options.defaultExpandedIds)
      for (const node of items)
        if (node.defaultOpen !== false) expanded.add(node.id)
    return expanded
  })

  const commitExpanded = React.useCallback(
    (next: Set<string>) => {
      setExpandedIds(next)
      onExpandedChange?.([...next])
    },
    [onExpandedChange]
  )

  // Navigating into a nested entry from elsewhere reveals its ancestors,
  // even ones the reader had collapsed. Adjusted during render so the
  // branch never paints closed for a frame first.
  const [prevActiveId, setPrevActiveId] = React.useState(activeId)
  if (activeId !== prevActiveId) {
    setPrevActiveId(activeId)
    if (activeId !== undefined) {
      const ancestors = ancestorIdsOf(items, activeId)
      if (ancestors.some((id) => !expandedIds.has(id)))
        setExpandedIds(new Set([...expandedIds, ...ancestors]))
    }
  }

  // Rail fold: controlled through `collapsed`, otherwise owned here. Only
  // `sidebar` has a rail — every other variant reads as expanded.
  const [ownCollapsed, setOwnCollapsed] = React.useState(
    options.defaultCollapsed ?? false
  )
  const collapsed =
    variant === "sidebar" ? (options.collapsed ?? ownCollapsed) : false

  const [renamingId, setRenamingId] = React.useState<string | null>(null)

  const canRename =
    variant === "files" && (onRename !== undefined || managesItems)
  const canMove = variant === "files" && (onMove !== undefined || managesItems)

  const isExpanded = React.useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  )

  const expand = React.useCallback(
    (id: string) => {
      if (expandedIds.has(id)) return
      commitExpanded(new Set([...expandedIds, id]))
      if (sound) playCue("toggle")
    },
    [commitExpanded, expandedIds, sound]
  )

  const collapse = React.useCallback(
    (id: string) => {
      if (!expandedIds.has(id)) return
      const next = new Set(expandedIds)
      next.delete(id)
      commitExpanded(next)
      if (sound) playCue("toggle")
    },
    [commitExpanded, expandedIds, sound]
  )

  const toggleExpanded = React.useCallback(
    (id: string) => {
      const next = new Set(expandedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      commitExpanded(next)
      if (sound) playCue("toggle")
    },
    [commitExpanded, expandedIds, sound]
  )

  const expandAll = React.useCallback(() => {
    commitExpanded(new Set(expandableIdsOf(items, variant === "files")))
  }, [commitExpanded, items, variant])

  const collapseAll = React.useCallback(() => {
    commitExpanded(new Set())
  }, [commitExpanded])

  /** Open every ancestor of `id` without touching the rest of the tree. */
  const reveal = React.useCallback(
    (id: string) => {
      const ancestors = ancestorIdsOf(items, id)
      if (!ancestors.some((ancestor) => !expandedIds.has(ancestor))) return
      commitExpanded(new Set([...expandedIds, ...ancestors]))
    },
    [commitExpanded, expandedIds, items]
  )

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (options.collapsed === undefined) setOwnCollapsed(next)
      onCollapsedChange?.(next)
      if (sound) playCue("toggle")
    },
    [options.collapsed, onCollapsedChange, sound]
  )

  const toggleCollapsed = React.useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed]
  )

  const getNode = React.useCallback(
    (id: string) => findNode(items, id),
    [items]
  )

  /** Selecting runs the node's own `onSelect` first, then `onNavigate` —
   * the same order a row press follows. Disabled nodes are inert. */
  const select = React.useCallback(
    (id: string) => {
      const node = findNode(items, id)
      if (!node || node.disabled) return
      if (options.activeId === undefined) setOwnActiveId(id)
      node.onSelect?.()
      onNavigate?.(node)
    },
    [items, options.activeId, onNavigate]
  )

  const startRename = React.useCallback(
    (id: string) => {
      // An id from elsewhere (a stale selection, another tree) would arm
      // rename mode against a row that never renders.
      if (!canRename || !findNode(items, id)) return
      setRenamingId(id)
    },
    [canRename, items]
  )

  const cancelRename = React.useCallback(() => setRenamingId(null), [])

  const rename = React.useCallback(
    (id: string, label: string) => {
      setRenamingId(null)
      const next = label.trim()
      if (!canRename || !next) return
      const node = findNode(items, id)
      if (!node || node.label === next) return
      onRename?.(id, next)
      if (managesItems) setItems(renameNode(items, id, next))
    },
    [canRename, items, managesItems, onRename, setItems]
  )

  const move = React.useCallback(
    (id: string, parentId: string | null, index: number) => {
      if (!canMove) return
      onMove?.(id, parentId, index)
      if (managesItems) setItems(moveNode(items, id, parentId, index))
    },
    [canMove, items, managesItems, onMove, setItems]
  )

  const dnd = useTreeDnd(items, canMove ? move : undefined)

  const sectionIds = React.useMemo(
    () => (sectioned ? items.map((node) => node.id) : []),
    [items, sectioned]
  )

  return React.useMemo<TreeController>(
    () => ({
      variant,
      items,
      sectioned,
      sectionIds,
      sound,
      getNode,
      expandedIds,
      isExpanded,
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      activeId,
      select,
      canRename,
      renamingId,
      startRename,
      cancelRename,
      rename,
      canMove,
      move,
      dnd,
    }),
    [
      variant,
      items,
      sectioned,
      sectionIds,
      sound,
      getNode,
      expandedIds,
      isExpanded,
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      activeId,
      select,
      canRename,
      renamingId,
      startRename,
      cancelRename,
      rename,
      canMove,
      move,
      dnd,
    ]
  )
}
