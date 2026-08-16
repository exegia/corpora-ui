import type * as React from "react"

/** One node in the tree. Nesting depth carries meaning per variant — see
 * `TreeProps["variant"]`. */
export interface TreeNode {
  id: string
  label: string
  /** Leading icon. Required in practice for `sidebar` — it is all that
   * remains of a row while the rail is collapsed. */
  icon?: React.ReactNode
  /** Renders an anchor. Without one the row is a button; `toc` leaves
   * default to `#{id}` so they scroll to the matching heading. */
  href?: string
  target?: "_blank" | "_self" | "_parent" | "_top"
  disabled?: boolean
  /** Start expanded. Ancestors of `activeId` expand regardless. */
  defaultOpen?: boolean
  /** Trailing hint — a count, a "New" pill. */
  badge?: React.ReactNode
  /** Fires on selection, before the tree-level `onNavigate`. */
  onSelect?: () => void
  children?: TreeNode[]
}

export type TreeVariant = "navigation" | "toc" | "sidebar" | "files"

/** Where a dragged row lands relative to its drop target. */
export type TreeDropPosition = "before" | "after" | "inside"

interface TreeBaseProps {
  items: TreeNode[]
  /** `id` of the current entry — matches any depth. Its ancestors expand. */
  activeId?: string
  /** Fires for every selection (rows and leaves alike), after the row's
   * anchor default — wire your router's navigate here. */
  onNavigate?: (node: TreeNode) => void
  /** Expand/collapse cues. Silent until `bindSounds()`. */
  sound?: boolean
  ariaLabel?: string
  className?: string
}

interface TreeReadonlyProps {
  collapsed?: never
  onMove?: never
  onRename?: never
  renderTrailing?: never
}

/** The four shapes a Tree takes. Editing props only exist on `files`;
 * `collapsed` only on `sidebar` — the union is the contract. */
export type TreeProps = TreeBaseProps &
  (
    | ({
        /** Nested app navigation. With 3 levels of nodes the top level
         * becomes collapsible section names (styled as headings, not
         * links); with 2 it renders plain link rows. */
        variant: "navigation"
      } & TreeReadonlyProps)
    | ({
        /** Table of contents: top-level nodes are routes, leaf nodes are
         * in-page anchors (`#{id}` unless the node carries an `href`). */
        variant: "toc"
      } & TreeReadonlyProps)
    | ({
        /** Single-level icon rail. `collapsed` shrinks rows to their
         * leading icon; nested children are ignored. */
        variant: "sidebar"
        collapsed?: boolean
      } & Omit<TreeReadonlyProps, "collapsed">)
    | {
        /** File explorer: only leaves navigate, folders toggle. Compact
         * spacing; rename, drag-and-drop and trailing actions enabled. */
        variant: "files"
        /** Enables drag-and-drop. Reorder `items` yourself: `parentId`
         * `null` means the root list, `index` is the slot among the new
         * siblings (computed on the list without the dragged node). */
        onMove?: (id: string, parentId: string | null, index: number) => void
        /** Enables inline rename (double-click or F2). */
        onRename?: (id: string, label: string) => void
        /** Row actions revealed on hover/focus — a menu, a delete icon. */
        renderTrailing?: (node: TreeNode) => React.ReactNode
        collapsed?: never
      }
  )

/** @internal What a row needs from the root, threaded through context so
 * the recursive rows stay prop-light. */
export interface TreeContextValue {
  variant: TreeVariant
  /** `navigation` with 3 levels of nodes — depth 0 renders as sections. */
  sectioned: boolean
  activeId?: string
  collapsed: boolean
  sound: boolean
  onNavigate?: (node: TreeNode) => void
  onRename?: (id: string, label: string) => void
  renderTrailing?: (node: TreeNode) => React.ReactNode
  isExpanded: (id: string) => boolean
  toggleExpanded: (id: string) => void
  /** Rename target id, `null` while idle. */
  renamingId: string | null
  setRenamingId: (id: string | null) => void
  dnd: TreeDndContextValue
}

/** @internal Drag state shared by every row (all `null`/no-op outside
 * `files`). */
export interface TreeDndContextValue {
  enabled: boolean
  draggedId: string | null
  /** Row the pointer is over and where the drop would land. */
  dropTarget: { id: string; position: TreeDropPosition } | null
  onRowDragStart: (event: React.DragEvent, id: string) => void
  onRowDragOver: (event: React.DragEvent, node: TreeNode) => void
  onRowDragLeave: (event: React.DragEvent) => void
  onRowDrop: (event: React.DragEvent, node: TreeNode) => void
  onRowDragEnd: () => void
}
