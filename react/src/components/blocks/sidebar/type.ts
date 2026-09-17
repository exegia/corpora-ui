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

/** Key for one sidebar's state in the store. Any stable string;
 * `useAISidebar` generates one when you don't pass it. */
export type AISidebarInstanceId = string

/** Options for `useAISidebar`. `items`, `activeId` and `expandedIds` are
 * each controlled when passed and hook-owned via their `default*` twin
 * otherwise. */
export interface UseAISidebarOptions {
  /** Key this sidebar's state under a name your app can address —
   * `useAISidebarState("app-resources")` / `useAISidebarActions(...)` reach
   * it from anywhere under `ExegiaProvider`. Without one the hook generates
   * a key and the state is dropped when the component unmounts. */
  sidebarId?: AISidebarInstanceId
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
  /** The key this sidebar's state is stored under. */
  sidebarId: AISidebarInstanceId
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

  /** Back to the values the sidebar mounted with. */
  reset: () => void

  /** @internal Row wiring the view threads through — drag state, the
   * hover pill and roving keyboard nav all belong to the rendering. */
  dnd: AISidebarDndState
  hover: AISidebarHoverState
  onRowKeyDown: (
    event: KeyboardEvent<HTMLDivElement>,
    row: FlatResource
  ) => void
  setRowRef: (id: string, node: HTMLDivElement | null) => void
}

/** @internal */
export interface AISidebarDndState extends AISidebarRowDndHandlers {
  draggingId: string | null
  dropTarget: DropTarget | null
  onRootDragOver: (event: DragEvent<HTMLDivElement>) => void
}

/** @internal The drag handlers a row needs, stable for the life of the
 * sidebar — they read drag state out of the store when they run instead of
 * closing over it, so handing them to every row costs no re-renders. */
export interface AISidebarRowDndHandlers {
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

/** A row takes its place in the tree and nothing else: selection,
 * expansion, focus, rename, drag and hover state all arrive through its own
 * atoms, and the rendering options through the sidebar context. */
export interface ResourceRowProps {
  row: FlatResource
}

/** @internal What a row needs from the block, threaded through context so
 * the rows stay prop-light.
 *
 * Deliberately free of sidebar state and of the controller. Rows read state
 * from per-row atoms, so this value keeps its identity for the life of the
 * sidebar and hovering or expanding one row no longer re-renders every row
 * through context. */
export interface AISidebarContextValue {
  sidebarId: AISidebarInstanceId
  /** Shared motion layoutId that lets the hover pill travel between rows. */
  hoverLayoutId: string
  renderIcon?: AISidebarProps["renderIcon"]
  renderMenu?: AISidebarProps["renderMenu"]
  renderActionsTrigger?: AISidebarProps["renderActionsTrigger"]
  /** Registers the row's DOM node with the block, which owns the ref map —
   * DOM nodes never go in the store. */
  setRowRef: (id: string, node: HTMLDivElement | null) => void
  onRowKeyDown: (
    event: KeyboardEvent<HTMLDivElement>,
    row: FlatResource
  ) => void
  onRowHover: (id: string, hovered: boolean) => void
  /** Closing returns DOM focus to the row that owned the menu, so it goes
   * through the block rather than the store. */
  closeMenu: () => void
  dnd: AISidebarRowDndHandlers
}

/** Everything observable about one sidebar, for consumers reading it by id. */
export interface AISidebarState {
  items: SidebarResource[]
  /** Visible rows in order, each with its depth and parent id. */
  flat: FlatResource[]
  selectedId: string | null
  expandedIds: ReadonlySet<string>
  focusedId: string | null
  renamingId: string | null
  menuOpenId: string | null
  draggingId: string | null
  dropTarget: DropTarget | null
  hoveredId: string | null
  /** A move is in flight — further moves are refused until it settles. */
  movePending: boolean
  /** Live-region text for the last move or rename outcome. */
  announcement: string
}

/** Everything doable to one sidebar from outside its component. */
export interface AISidebarActions {
  select: (id: string) => void
  expand: (id: string) => void
  collapse: (id: string) => void
  toggleExpanded: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  reveal: (id: string) => void
  /** Moves the roving-focus target. DOM focus follows only for callers that
   * hold the controller — the ref map lives in the block, not the store. */
  focus: (id: string) => void
  startRename: (id: string) => void
  cancelRename: () => void
  rename: (id: string, label: string) => void
  openMenu: (id: string) => void
  closeMenu: () => void
  move: (move: SidebarResourceMove) => Promise<void>
  setItems: (items: SidebarResource[]) => void
  reset: () => void
}

/** @internal Projection of `useAISidebar`'s options — primitives only, so
 * the store write runs once per real change instead of once per render. */
export interface AISidebarConfig {
  controlsItems: boolean
  controlsActiveId: boolean
  controlsExpandedIds: boolean
}

/** @internal Latest option callbacks. Only write atoms read this, so it can
 * be refreshed every commit without re-rendering anything. */
export interface AISidebarHandlers {
  onItemsChange?: (items: SidebarResource[]) => void
  onMove?: (move: SidebarResourceMove) => void | Promise<void>
  onMoveError?: (error: unknown, move: SidebarResourceMove) => void
  onRename?: (item: SidebarResource, label: string) => void | Promise<void>
  onActiveChange?: (id: string) => void
  onExpandedChange?: (ids: string[]) => void
}

/** @internal What an instance starts from, replayed by
 * `resetAISidebarAtom`. */
export interface AISidebarSeed {
  items: SidebarResource[]
  /** Hook-owned selection — the `defaultActiveId`, never the controlled
   * `activeId`. */
  activeId: string | null
  focusedId: string | null
  expandedIds: string[]
}
