"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  cancelTreeRenameAtom,
  collapseAllTreeNodesAtom,
  collapseTreeNodeAtom,
  expandAllTreeNodesAtom,
  expandTreeNodeAtom,
  moveTreeNodeAtom,
  renameTreeNodeAtom,
  resetTreeAtom,
  revealTreeNodeAtom,
  selectTreeNodeAtom,
  setTreeCollapsedAtom,
  setTreeItemsAtom,
  startTreeRenameAtom,
  toggleTreeCollapsedAtom,
  toggleTreeNodeAtom,
  treeStateAtom,
} from "./tree-atom"
import type { TreeActions, TreeInstanceId, TreeState } from "./type"

/**
 * Read the tree registered under `treeId` from anywhere below
 * `ExegiaProvider` — no controller, no props, no provider of its own.
 *
 * ```tsx
 * const { collapsed, activeId } = useTreeState("app-nav")
 * ```
 *
 * This returns the whole state object, so the caller re-renders on any
 * change. A component that reads one field should subscribe to that field's
 * atom instead: `useAtomValue(treeCollapsedAtom("app-nav"))`.
 */
export function useTreeState(treeId: TreeInstanceId): TreeState {
  return useAtomValue(treeStateAtom(treeId))
}

/**
 * Drive the tree registered under `treeId` from anywhere. Writes only — the
 * caller never re-renders when the tree changes, so this is what a command
 * palette, a keyboard shortcut or a route guard should reach for.
 *
 * ```tsx
 * const nav = useTreeActions("app-nav")
 * <Button onClick={nav.collapseAll}>Collapse all</Button>
 * ```
 */
export function useTreeActions(treeId: TreeInstanceId): TreeActions {
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
  const setItems = useSetAtom(setTreeItemsAtom(treeId))
  const reset = useSetAtom(resetTreeAtom(treeId))

  return React.useMemo(
    () => ({
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      setCollapsed,
      toggleCollapsed,
      select,
      startRename,
      cancelRename,
      rename,
      move,
      setItems,
      reset,
    }),
    [
      expand,
      collapse,
      toggleExpanded,
      expandAll,
      collapseAll,
      reveal,
      setCollapsed,
      toggleCollapsed,
      select,
      startRename,
      cancelRename,
      rename,
      move,
      setItems,
      reset,
    ]
  )
}
