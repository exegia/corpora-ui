import type { ReactElement, ReactNode, DragEvent, KeyboardEvent } from "react"

export type SidebarResourceKind = "folder" | "project" | "file" | "bookmark"

export interface SidebarResource {
  id: string
  label: string
  kind: SidebarResourceKind
  children?: SidebarResource[]
  disabled?: boolean
}

export type SidebarResourceDropPosition = "before" | "inside" | "after"

export interface SidebarResourceMove {
  itemId: string
  targetId: string | null
  position: SidebarResourceDropPosition
}

export interface SidebarResourceMenuControls {
  close: () => void
  rename: () => void
}

/** Options for `useAISidebar`. `items`, `activeId` and `expandedIds` are
 * each controlled when passed and hook-owned via their `default*` twin
 * otherwise. */
export interface UseAISidebarOptions {
  items?: SidebarResource[]
  defaultItems?: SidebarResource[]
  onItemsChange?: (items: SidebarResource[]) => void
  /** Reject the promise to roll the optimistic move back. */
  onMove?: (move: SidebarResourceMove) => void | Promise<void>
  onMoveError?: (error: unknown, move: SidebarResourceMove) => void
  onRename?: (item: SidebarResource, label: string) => void | Promise<void>
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string) => void
  expandedIds?: string[]
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void
}

/** Everything the sidebar can do, callable from outside the block — a
 * toolbar, a command palette, a route change. Returned by `useAISidebar`
 * and accepted by `<AISidebar controller={…} />`. */
export interface AISidebarController {
  items: SidebarResource[]
  /** Visible rows in order, each with its depth and parent id. */
  flat: FlatResource[]
  getItem: (id: string) => SidebarResource | undefined

  selectedId: string | null
  select: (id: string) => void

  expandedIds: ReadonlySet<string>
  isExpanded: (id: string) => boolean
  expand: (id: string) => void
  collapse: (id: string) => void
  toggleExpanded: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  /** Open every ancestor of `id`, leaving the rest of the tree alone. */
  reveal: (id: string) => void

  /** Roving-focus target. `focus` also moves DOM focus to the row. */
  focusedId: string | null
  focus: (id: string) => void

  renamingId: string | null
  startRename: (id: string) => void
  cancelRename: () => void
  /** Commit a rename and leave rename mode. Applied optimistically and
   * rolled back if `onRename` rejects. Blank and unchanged labels are
   * dropped. */
  rename: (id: string, label: string) => void

  menuOpenId: string | null
  openMenu: (id: string) => void
  closeMenu: () => void

  /** Reorder, applied optimistically and rolled back if `onMove` rejects.
   * Refuses moves the data forbids (into itself, into a non-container). */
  move: (move: SidebarResourceMove) => Promise<void>
  /** A move is in flight — further moves are refused until it settles. */
  movePending: boolean

  /** Live-region text for the last move or rename outcome. */
  announcement: string

  /** @internal Row wiring the view threads through — drag state, the
   * hover pill and roving keyboard nav all belong to the rendering. */
  dnd: AISidebarDndState
  hover: AISidebarHoverState
  onRowKeyDown: (event: KeyboardEvent<HTMLDivElement>, row: FlatResource) => void
  setRowRef: (id: string, node: HTMLDivElement | null) => void
}

/** @internal */
export interface AISidebarDndState {
  draggingId: string | null
  dropTarget: DropTarget | null
  onRootDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onRowDragStart: (event: DragEvent<HTMLDivElement>, id: string) => void
  onRowDragEnd: () => void
  onRowDragOver: (event: DragEvent<HTMLDivElement>, row: FlatResource) => void
}

/** @internal */
export interface AISidebarHoverState {
  hoveredId: string | null
  /** Shared motion layoutId that lets the pill travel between rows. */
  layoutId: string
  onRowHover: (id: string, hovered: boolean) => void
  clear: () => void
}

export interface AISidebarProps extends UseAISidebarOptions {
  /** Never set on the data form — `controller` selects the other one. */
  controller?: never
  renderIcon?: (item: SidebarResource) => ReactNode
  renderMenu?: (
    item: SidebarResource,
    controls: SidebarResourceMenuControls
  ) => ReactNode
  /**
   * Replaces the default "…" actions button. Must return a single element —
   * the popover clones it to attach its trigger ref and click handler.
   */
  renderActionsTrigger?: (item: SidebarResource) => ReactElement
  ariaLabel?: string
  className?: string
}

/** Presentational props, shared by both forms of `<AISidebar>`. */
export type AISidebarViewProps = Pick<
  AISidebarProps,
  | "renderIcon"
  | "renderMenu"
  | "renderActionsTrigger"
  | "ariaLabel"
  | "className"
>

/** Drive the block from a `useAISidebar` controller instead of raw props —
 * the controller carries the data and every handler. */
export interface AISidebarControllerProps extends AISidebarViewProps {
  controller: AISidebarController
}

/** Either form: raw props, or a `useAISidebar` controller. */
export type AISidebarComponentProps = AISidebarProps | AISidebarControllerProps

export interface FlatResource {
  item: SidebarResource
  depth: number
  parentId: string | null
}

export interface DropTarget {
  id: string | null
  position: SidebarResourceDropPosition
}

export interface ResourceRowProps {
  row: FlatResource
  active: boolean
  expanded: boolean
  focused: boolean
  draggingId: string | null
  dropTarget: DropTarget | null
  menuOpen: boolean
  renaming: boolean
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLDivElement>, row: FlatResource) => void
  onDragStart: (event: DragEvent<HTMLDivElement>, id: string) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onMenuOpenChange: (open: boolean) => void
  onRenameCancel: () => void
  onRenameCommit: (label: string) => void
  onRenameStart: () => void
  onSelect: () => void
  onToggle: () => void
  /** Some row in the tree is hovered — mounts the pill fade wrapper. */
  hoverActive?: boolean
  /** This row owns the sliding hover pill. */
  hoverPill?: boolean
  /** Shared motion layoutId that lets the pill travel between rows. */
  hoverLayoutId?: string
  onHoverChange?: (hovered: boolean) => void
  renderIcon?: (item: SidebarResource) => ReactNode
  renderMenu?: AISidebarProps["renderMenu"]
  renderActionsTrigger?: AISidebarProps["renderActionsTrigger"]
  setRef: (node: HTMLDivElement | null) => void
}
