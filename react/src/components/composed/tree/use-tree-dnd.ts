"use client"

import * as React from "react"
import { useAtomValue, useSetAtom, useStore } from "jotai"

import {
  endTreeDragAtom,
  moveTreeNodeAtom,
  treeCanMoveAtom,
  treeDraggedIdAtom,
  treeDropTargetAtom,
  treeItemsAtom,
} from "./tree-atom"
import type {
  TreeDndContextValue,
  TreeDndHandlers,
  TreeDropPosition,
  TreeInstanceId,
  TreeNode,
} from "./type"
import { containsNode, findNode, locateNode } from "./utils"

/** How far into a folder row the pointer must sit (from either edge) to read
 * as "inside" rather than "before"/"after". */
const EDGE_RATIO = 0.25

/**
 * The drag handlers for the `files` variant, stable for the life of the tree.
 *
 * Nothing here subscribes to drag state: items, the dragged id and the drop
 * target are read out of the store when a handler runs. That is what lets
 * every row share one handler object without re-rendering when a drag moves —
 * and it keeps `useTree` from subscribing to data it also projects from
 * props, which would loop on an inline `items` array.
 *
 * Inert unless the tree `canMove`. `dataTransfer` is set for interop but
 * never read, so the flow also works where the store is unavailable (tests,
 * some webviews).
 */
export function useTreeDndHandlers(treeId: TreeInstanceId): TreeDndHandlers {
  const store = useStore()
  const enabled = useAtomValue(treeCanMoveAtom(treeId))
  const setDraggedId = useSetAtom(treeDraggedIdAtom(treeId))
  const setDropTarget = useSetAtom(treeDropTargetAtom(treeId))
  const move = useSetAtom(moveTreeNodeAtom(treeId))
  const reset = useSetAtom(endTreeDragAtom(treeId))

  const readItems = React.useCallback(
    () => store.get(treeItemsAtom(treeId)),
    [store, treeId]
  )
  const readDraggedId = React.useCallback(
    () => store.get(treeDraggedIdAtom(treeId)),
    [store, treeId]
  )
  const readDropTarget = React.useCallback(
    () => store.get(treeDropTargetAtom(treeId)),
    [store, treeId]
  )

  const onRowDragStart = React.useCallback(
    (event: React.DragEvent, id: string) => {
      if (!enabled) return
      event.stopPropagation()
      setDraggedId(id)
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", id)
      }
    },
    [enabled, setDraggedId]
  )

  const onRowDragOver = React.useCallback(
    (event: React.DragEvent, node: TreeNode) => {
      const draggedId = readDraggedId()
      if (!enabled || draggedId === null) return
      // A node never drops onto itself or into its own subtree.
      if (containsNode(readItems(), draggedId, node.id)) return
      event.preventDefault()
      event.stopPropagation()
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move"

      const rect = event.currentTarget.getBoundingClientRect()
      const ratio =
        rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5
      // Any node carrying a children array is a folder — an empty one still
      // accepts drops "inside".
      const folder = node.children !== undefined
      const position: TreeDropPosition = folder
        ? ratio < EDGE_RATIO
          ? "before"
          : ratio > 1 - EDGE_RATIO
            ? "after"
            : "inside"
        : ratio < 0.5
          ? "before"
          : "after"
      setDropTarget((prev) =>
        prev?.id === node.id && prev.position === position
          ? prev
          : { id: node.id, position }
      )
    },
    [enabled, readDraggedId, readItems, setDropTarget]
  )

  const onRowDragLeave = React.useCallback(
    (event: React.DragEvent) => {
      // Leaving for a child of the same row still counts as hovering it.
      const next = event.relatedTarget as Node | null
      if (next && event.currentTarget.contains(next)) return
      setDropTarget(null)
    },
    [setDropTarget]
  )

  const onRowDrop = React.useCallback(
    (event: React.DragEvent, node: TreeNode) => {
      if (!enabled) return
      event.preventDefault()
      event.stopPropagation()
      const draggedId = readDraggedId()
      const target = readDropTarget()
      if (draggedId === null || target === null || target.id !== node.id) {
        reset()
        return
      }
      const items = readItems()

      if (target.position === "inside") {
        // Append at the end of the folder, sized without the dragged node (it
        // may already live there).
        const children = node.children ?? []
        const index = children.filter((child) => child.id !== draggedId).length
        move(draggedId, node.id, index)
      } else {
        const location = locateNode(items, node.id)
        if (location) {
          const siblings = (
            location.parentId === null
              ? items
              : (findNode(items, location.parentId)?.children ?? [])
          ).filter((sibling) => sibling.id !== draggedId)
          const at = siblings.findIndex((sibling) => sibling.id === node.id)
          const index = target.position === "after" ? at + 1 : at
          move(draggedId, location.parentId, index)
        }
      }
      reset()
    },
    [enabled, move, readDraggedId, readDropTarget, readItems, reset]
  )

  return React.useMemo(
    () => ({
      enabled,
      onRowDragStart,
      onRowDragOver,
      onRowDragLeave,
      onRowDrop,
      onRowDragEnd: reset,
    }),
    [enabled, onRowDragStart, onRowDragOver, onRowDragLeave, onRowDrop, reset]
  )
}

/** The handlers plus live drag state, for `TreeController.dnd`. Rows take the
 * handlers alone and read the state per node instead. */
export function useTreeDnd(treeId: TreeInstanceId): TreeDndContextValue {
  const handlers = useTreeDndHandlers(treeId)
  const draggedId = useAtomValue(treeDraggedIdAtom(treeId))
  const dropTarget = useAtomValue(treeDropTargetAtom(treeId))

  return React.useMemo(
    () => ({ ...handlers, draggedId, dropTarget }),
    [handlers, draggedId, dropTarget]
  )
}
