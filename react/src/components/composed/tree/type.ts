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

/** Key for one tree’s state in the store. Any stable string; `useTree`
 * generates one when you don't pass it. */
export type TreeInstanceId = string

/** Row a drag hovers, and where the drop would land. */
export interface TreeDropTarget {
  id: string
  position: TreeDropPosition
}

interface TreeBaseProps {
  items: TreeNode[]
  /** Key this tree's state under a name your app can address —
   * `useTreeState("app-nav")` / `useTreeActions("app-nav")` reach it from
   * anywhere under `ExegiaProvider`. Without one the tree generates a key
   * and its state is dropped when it unmounts. */
  treeId?: TreeInstanceId
  /** Never set on the data form — `tree` selects the controller form. */
  tree?: never
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

/** Drive the tree from a `useTree` controller instead of raw props. The
 * controller carries the variant, the data and every handler; only the
 * presentational props stay here. */
export interface TreeControllerProps {
  tree: TreeController
  items?: never
  ariaLabel?: string
  className?: string
  /** Row actions revealed on hover/focus (`files` only — ignored by the
   * other variants, which the controller form cannot type-gate). */
  renderTrailing?: (node: TreeNode) => React.ReactNode
}

/** Either form: raw props, or a `useTree` controller via `tree`. */
export type TreeProps = TreeDataProps | TreeControllerProps

/** The four shapes a Tree takes. Editing props only exist on `files`;
 * `collapsed` only on `sidebar` — the union is the contract. */
export type TreeDataProps = TreeBaseProps &
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

/** Options for `useTree`. Each of `items`, `activeId` and `collapsed` is
 * controlled when passed and hook-owned when its `default*` twin is used
 * instead. */
export interface UseTreeOptions {
  /** Key this tree's state under a name your app can address —
   * `useTreeState("app-nav")` / `useTreeActions("app-nav")` reach it from
   * anywhere under `ExegiaProvider`. Without one the hook generates a key
   * and the state is dropped when the component unmounts. */
  treeId?: TreeInstanceId
  /** Which shape the tree takes — gates rename/reorder (`files`) and the
   * collapsible rail (`sidebar`). */
  variant: TreeVariant
  /** Controlled data. With it, `rename`/`move` only report the edit unless
   * you also pass `onItemsChange`. */
  items?: TreeNode[]
  /** Hook-owned data — `rename` and `move` apply the edit themselves. */
  defaultItems?: TreeNode[]
  /** Next tree after a `rename`/`move`. Also enables self-applying edits
   * on top of controlled `items`. */
  onItemsChange?: (items: TreeNode[]) => void
  /** Controlled selection. Ancestors of the active node expand. */
  activeId?: string
  defaultActiveId?: string
  /** Fires for every selection (rows and leaves alike), after the node's
   * own `onSelect` — wire your router's navigate here. */
  onNavigate?: (node: TreeNode) => void
  /** Start with these ids expanded instead of the `defaultOpen` set. */
  defaultExpandedIds?: Iterable<string>
  onExpandedChange?: (ids: string[]) => void
  /** Controlled rail fold (`sidebar` only). */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Enables rename (`files`). Not needed when the hook owns the data. */
  onRename?: (id: string, label: string) => void
  /** Enables drag-and-drop (`files`). `parentId` `null` means the root
   * list, `index` is the slot among the new siblings (computed on the list
   * without the moved node). Not needed when the hook owns the data. */
  onMove?: (id: string, parentId: string | null, index: number) => void
  /** Expand/collapse cues. Silent until `bindSounds()`. */
  sound?: boolean
}

/** Everything the tree can do, callable from outside the component.
 * Returned by `useTree` and accepted by `<Tree tree={…} />`. */
export interface TreeController {
  /** The key this tree's state is stored under. */
  treeId: TreeInstanceId
  variant: TreeVariant
  items: TreeNode[]
  /** `navigation` with 3 levels of nodes — depth 0 renders as sections. */
  sectioned: boolean
  /** Ids of the section headings, empty unless `sectioned`. Pass one to
   * `expand`/`collapse`/`toggleExpanded` to work a whole section. */
  sectionIds: string[]
  sound: boolean
  getNode: (id: string) => TreeNode | null

  expandedIds: ReadonlySet<string>
  isExpanded: (id: string) => boolean
  expand: (id: string) => void
  collapse: (id: string) => void
  toggleExpanded: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  /** Open every ancestor of `id`, leaving the rest of the tree alone. */
  reveal: (id: string) => void

  /** Rail folded to icons — always `false` outside `sidebar`. */
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void

  activeId?: string
  /** Select a node: runs its `onSelect`, then `onNavigate`. Inert on
   * disabled and unknown nodes. */
  select: (id: string) => void

  /** Whether rename is wired up at all (`files` + a handler or owned data). */
  canRename: boolean
  /** Rename target id, `null` while idle. */
  renamingId: string | null
  startRename: (id: string) => void
  cancelRename: () => void
  /** Commit a rename and leave rename mode. Blank or unchanged labels are
   * dropped. */
  rename: (id: string, label: string) => void

  /** Whether reorder is wired up at all. */
  canMove: boolean
  move: (id: string, parentId: string | null, index: number) => void

  /** Back to the values the tree mounted with. */
  reset: () => void

  dnd: TreeDndContextValue
}

/** @internal What a row needs from the root, threaded through context so
 * the recursive rows stay prop-light.
 *
 * Deliberately free of tree state. Rows read state from per-node atoms, so
 * this value keeps its identity for the life of the tree and expanding one
 * branch no longer re-renders every row through context. */
export interface TreeContextValue {
  treeId: TreeInstanceId
  renderTrailing?: (node: TreeNode) => React.ReactNode
  dnd: TreeDndHandlers
}

/** @internal The drag event handlers, stable for the life of the tree —
 * they read drag state out of the store instead of closing over it, so
 * handing them to every row costs no re-renders. */
export interface TreeDndHandlers {
  enabled: boolean
  onRowDragStart: (event: React.DragEvent, id: string) => void
  onRowDragOver: (event: React.DragEvent, node: TreeNode) => void
  onRowDragLeave: (event: React.DragEvent) => void
  onRowDrop: (event: React.DragEvent, node: TreeNode) => void
  onRowDragEnd: () => void
}

/** @internal Handlers plus live drag state — what `TreeController.dnd`
 * exposes (all `null`/no-op outside `files`). */
export interface TreeDndContextValue extends TreeDndHandlers {
  draggedId: string | null
  /** Row the pointer is over and where the drop would land. */
  dropTarget: TreeDropTarget | null
}

/** Everything observable about one tree, for consumers reading it by id. */
export interface TreeState {
  variant: TreeVariant
  items: TreeNode[]
  activeId?: string
  expandedIds: ReadonlySet<string>
  collapsed: boolean
  renamingId: string | null
  sectioned: boolean
  sectionIds: string[]
  canRename: boolean
  canMove: boolean
  draggedId: string | null
  dropTarget: TreeDropTarget | null
}

/** Everything doable to one tree from outside its component. */
export interface TreeActions {
  expand: (id: string) => void
  collapse: (id: string) => void
  toggleExpanded: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  reveal: (id: string) => void
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
  select: (id: string) => void
  startRename: (id: string) => void
  cancelRename: () => void
  rename: (id: string, label: string) => void
  move: (id: string, parentId: string | null, index: number) => void
  setItems: (items: TreeNode[]) => void
  reset: () => void
}

/** @internal Projection of `useTree`'s options — primitives only, so the
 * store write runs once per real change instead of once per render. */
export interface TreeConfig {
  variant: TreeVariant
  sound: boolean
  controlsItems: boolean
  controlsActiveId: boolean
  controlsCollapsed: boolean
  managesItems: boolean
  hasRenameHandler: boolean
  hasMoveHandler: boolean
}

/** @internal Latest option callbacks. Only write atoms read this, so it
 * can be refreshed every commit without re-rendering anything. */
export interface TreeHandlers {
  onNavigate?: (node: TreeNode) => void
  onItemsChange?: (items: TreeNode[]) => void
  onExpandedChange?: (ids: string[]) => void
  onCollapsedChange?: (collapsed: boolean) => void
  onRename?: (id: string, label: string) => void
  onMove?: (id: string, parentId: string | null, index: number) => void
}

/** @internal What an instance starts from, replayed by `resetTreeAtom`. */
export interface TreeSeed {
  items: TreeNode[]
  activeId?: string
  collapsed: boolean
  expandedIds?: string[]
}
