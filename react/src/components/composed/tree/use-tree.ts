"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  cancelTreeRenameAtom,
  collapseAllTreeNodesAtom,
  collapseTreeNodeAtom,
  expandAllTreeNodesAtom,
  expandTreeNodeAtom,
  mountTreeAtom,
  moveTreeNodeAtom,
  projectTreeActiveIdAtom,
  projectTreeCollapsedAtom,
  projectTreeItemsAtom,
  removeTreeInstance,
  renameTreeNodeAtom,
  resetTreeAtom,
  revealTreeAncestorsAtom,
  revealTreeNodeAtom,
  selectTreeNodeAtom,
  setTreeCollapsedAtom,
  setTreeHandlersAtom,
  startTreeRenameAtom,
  toggleTreeCollapsedAtom,
  toggleTreeNodeAtom,
  treeActiveIdAtom,
  treeCanMoveAtom,
  treeCanRenameAtom,
  treeCollapsedAtom,
  treeExpandedIdsAtom,
  treeOwnedItemsAtom,
  treeRenamingIdAtom,
} from "./tree-atom"
import type {
  TreeConfig,
  TreeController,
  TreeHandlers,
  TreeSeed,
  UseTreeOptions,
} from "./type"
import { useTreeDnd } from "./use-tree-dnd"
import { findNode, hasThreeLevels } from "./utils"

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
 *
 * State lives in Jotai atoms keyed by `treeId`, so anything under
 * `ExegiaProvider` can drive this tree without the controller — name it and
 * reach for `useTreeState(treeId)` / `useTreeActions(treeId)` elsewhere.
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

  // A generated key isolates unnamed trees from each other; an explicit
  // `treeId` is the app's handle on this one.
  const generatedId = React.useId()
  const treeId = options.treeId ?? generatedId

  const controlsItems = options.items !== undefined
  const controlsActiveId = options.activeId !== undefined
  const controlsCollapsed = options.collapsed !== undefined
  // The hook may only rewrite the data when it owns it, or when the consumer
  // asked for the next tree through `onItemsChange`.
  const managesItems = !controlsItems || onItemsChange !== undefined
  const hasRenameHandler = onRename !== undefined
  const hasMoveHandler = onMove !== undefined

  // Primitives only, so this object is stable and the store write below runs
  // once per real change rather than once per render.
  const config = React.useMemo<TreeConfig>(
    () => ({
      variant,
      sound,
      controlsItems,
      controlsActiveId,
      controlsCollapsed,
      managesItems,
      hasRenameHandler,
      hasMoveHandler,
    }),
    [
      variant,
      sound,
      controlsItems,
      controlsActiveId,
      controlsCollapsed,
      managesItems,
      hasRenameHandler,
      hasMoveHandler,
    ]
  )

  const handlers = React.useMemo<TreeHandlers>(
    () => ({
      onNavigate,
      onItemsChange,
      onExpandedChange,
      onCollapsedChange,
      onRename,
      onMove,
    }),
    [
      onNavigate,
      onItemsChange,
      onExpandedChange,
      onCollapsedChange,
      onRename,
      onMove,
    ]
  )

  // Read once: the `default*` options describe the mount, not every render.
  const [seed] = React.useState<TreeSeed>(() => ({
    items: options.items ?? options.defaultItems ?? [],
    activeId: options.activeId ?? options.defaultActiveId,
    collapsed: options.collapsed ?? options.defaultCollapsed ?? false,
    expandedIds: options.defaultExpandedIds
      ? [...options.defaultExpandedIds]
      : undefined,
  }))

  const mount = useSetAtom(mountTreeAtom(treeId))
  const publishHandlers = useSetAtom(setTreeHandlersAtom(treeId))
  const projectItems = useSetAtom(projectTreeItemsAtom(treeId))
  const projectActiveId = useSetAtom(projectTreeActiveIdAtom(treeId))
  const projectCollapsed = useSetAtom(projectTreeCollapsedAtom(treeId))
  const revealAncestors = useSetAtom(revealTreeAncestorsAtom(treeId))

  // Handlers first — they must be in the store before any action can fire.
  // Rewritten every commit; no read atom depends on them, so nobody
  // re-renders for it.
  React.useLayoutEffect(() => {
    publishHandlers(handlers)
  }, [publishHandlers, handlers])

  // Before paint, so a seeded branch never paints closed for a frame.
  React.useLayoutEffect(() => {
    mount(config, seed)
  }, [mount, config, seed])

  // Controlled props stay the source of truth; the store carries a projection
  // so the action atoms and remote readers see current data.
  React.useLayoutEffect(() => {
    if (options.items !== undefined) projectItems(options.items)
  }, [options.items, projectItems])

  React.useLayoutEffect(() => {
    if (options.activeId !== undefined) projectActiveId(options.activeId)
  }, [options.activeId, projectActiveId])

  React.useLayoutEffect(() => {
    if (options.collapsed !== undefined) projectCollapsed(options.collapsed)
  }, [options.collapsed, projectCollapsed])

  // A tree the hook keyed is scrap once its component goes. An explicit
  // `treeId` is the app's key and outlives the mount.
  React.useEffect(() => {
    if (options.treeId !== undefined) return
    return () => removeTreeInstance(treeId)
  }, [treeId, options.treeId])

  // Never `treeItemsAtom` — see the note on `treeOwnedItemsAtom`.
  const ownedItems = useAtomValue(treeOwnedItemsAtom(treeId))
  const items = options.items ?? ownedItems
  const activeId = useAtomValue(treeActiveIdAtom(treeId))
  const expandedIds = useAtomValue(treeExpandedIdsAtom(treeId))
  const collapsed = useAtomValue(treeCollapsedAtom(treeId))
  const renamingId = useAtomValue(treeRenamingIdAtom(treeId))
  const canRename = useAtomValue(treeCanRenameAtom(treeId))
  const canMove = useAtomValue(treeCanMoveAtom(treeId))

  // Navigating into a nested entry from elsewhere reveals its ancestors, even
  // ones the reader had collapsed. In a layout effect, so the branch is open
  // before the frame paints.
  const lastActiveId = React.useRef(activeId)
  React.useLayoutEffect(() => {
    if (lastActiveId.current === activeId) return
    lastActiveId.current = activeId
    if (activeId !== undefined) revealAncestors(activeId)
  }, [activeId, revealAncestors])

  const sectioned = React.useMemo(
    () => variant === "navigation" && hasThreeLevels(items),
    [variant, items]
  )
  const sectionIds = React.useMemo(
    () => (sectioned ? items.map((node) => node.id) : []),
    [items, sectioned]
  )
  const getNode = React.useCallback(
    (id: string) => findNode(items, id),
    [items]
  )
  const isExpanded = React.useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  )

  // `useSetAtom` setters are already stable — no useCallback needed.
  const expand = useSetAtom(expandTreeNodeAtom(treeId))
  const collapse = useSetAtom(collapseTreeNodeAtom(treeId))
  const toggleExpanded = useSetAtom(toggleTreeNodeAtom(treeId))
  const expandAll = useSetAtom(expandAllTreeNodesAtom(treeId))
  const collapseAll = useSetAtom(collapseAllTreeNodesAtom(treeId))
  const reveal = useSetAtom(revealTreeNodeAtom(treeId))
  const setCollapsed = useSetAtom(setTreeCollapsedAtom(treeId))
  const toggleCollapsed = useSetAtom(toggleTreeCollapsedAtom(treeId))
  const select = useSetAtom(selectTreeNodeAtom(treeId))
  const startRename = useSetAtom(startTreeRenameAtom(treeId))
  const cancelRename = useSetAtom(cancelTreeRenameAtom(treeId))
  const rename = useSetAtom(renameTreeNodeAtom(treeId))
  const move = useSetAtom(moveTreeNodeAtom(treeId))
  const reset = useSetAtom(resetTreeAtom(treeId))

  const dnd = useTreeDnd(treeId)

  return React.useMemo<TreeController>(
    () => ({
      treeId,
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
      reset,
      dnd,
    }),
    [
      treeId,
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
      reset,
      dnd,
    ]
  )
}
