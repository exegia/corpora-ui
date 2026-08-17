"use client"

import * as React from "react"

import type {
  TreeDndContextValue,
  TreeDropPosition,
  TreeNode,
  UseTreeOptions,
} from "./type"
import { containsNode, findNode, locateNode } from "./utils"

/** How far into a folder row the pointer must sit (from either edge) to
 * read as "inside" rather than "before"/"after". */
const EDGE_RATIO = 0.25

/** Owns drag state for the `files` variant: which row is in flight, which
 * row the pointer rests on and where the drop would land. Everything is
 * component state — `dataTransfer` is set for interop but never read, so
 * the flow also works where the store is unavailable (tests, some
 * webviews). Without `onMove` every handler is inert. */
export function useTreeDnd(
  items: readonly TreeNode[],
  onMove: UseTreeOptions["onMove"]
): TreeDndContextValue {
  const enabled = onMove !== undefined
  const [draggedId, setDraggedId] = React.useState<string | null>(null)
  const [dropTarget, setDropTarget] = React.useState<{
    id: string
    position: TreeDropPosition
  } | null>(null)

  const reset = React.useCallback(() => {
    setDraggedId(null)
    setDropTarget(null)
  }, [])

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
    [enabled]
  )

  const onRowDragOver = React.useCallback(
    (event: React.DragEvent, node: TreeNode) => {
      if (!enabled || draggedId === null) return
      // A node never drops onto itself or into its own subtree.
      if (containsNode(items, draggedId, node.id)) return
      event.preventDefault()
      event.stopPropagation()
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move"

      const rect = event.currentTarget.getBoundingClientRect()
      const ratio =
        rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5
      // Any node carrying a children array is a folder — an empty one
      // still accepts drops "inside".
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
    [enabled, draggedId, items]
  )

  const onRowDragLeave = React.useCallback((event: React.DragEvent) => {
    // Leaving for a child of the same row still counts as hovering it.
    const next = event.relatedTarget as Node | null
    if (next && event.currentTarget.contains(next)) return
    setDropTarget(null)
  }, [])

  const onRowDrop = React.useCallback(
    (event: React.DragEvent, node: TreeNode) => {
      if (!enabled) return
      event.preventDefault()
      event.stopPropagation()
      const target = dropTarget
      if (draggedId === null || target === null || target.id !== node.id) {
        reset()
        return
      }

      if (target.position === "inside") {
        // Append at the end of the folder, sized without the dragged node
        // (it may already live there).
        const children = node.children ?? []
        const index = children.filter((child) => child.id !== draggedId).length
        onMove?.(draggedId, node.id, index)
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
          onMove?.(draggedId, location.parentId, index)
        }
      }
      reset()
    },
    [enabled, draggedId, dropTarget, items, onMove, reset]
  )

  return React.useMemo(
    () => ({
      enabled,
      draggedId,
      dropTarget,
      onRowDragStart,
      onRowDragOver,
      onRowDragLeave,
      onRowDrop,
      onRowDragEnd: reset,
    }),
    [
      enabled,
      draggedId,
      dropTarget,
      onRowDragStart,
      onRowDragOver,
      onRowDragLeave,
      onRowDrop,
      reset,
    ]
  )
}
