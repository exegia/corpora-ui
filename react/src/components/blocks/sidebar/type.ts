import type { ReactElement, ReactNode, DragEvent, KeyboardEvent } from "react"

export type TSidebarResourceKind = "folder" | "project" | "file" | "bookmark"

export interface ISidebarResource {
  id: string
  label: string
  kind: TSidebarResourceKind
  children?: ISidebarResource[]
  disabled?: boolean
}

export type TSidebarResourceDropPosition = "before" | "inside" | "after"

export interface ISidebarResourceMove {
  itemId: string
  targetId: string | null
  position: TSidebarResourceDropPosition
}

export interface ISidebarResourceMenuControls {
  close: () => void
  rename: () => void
}

/** Key for one sidebar's state in the store. Any stable string;
 * `useAISidebar` generates one when you don't pass it. */
export type TAISidebarInstanceId = string

/** Options for `useAISidebar`. `items`, `activeId` and `expandedIds` are
 * each controlled when passed and hook-owned via their `default*` twin
 * otherwise. */
export interface IUseAISidebarOptions {
  /** Key this sidebar's state under a name your app can address —
   * `useAISidebarState("app-resources")` / `useAISidebarActions(...)` reach
   * it from anywhere under `ExegiaProvider`. Without one the hook generates
   * a key and the state is dropped when the component unmounts. */
  sidebarId?: TAISidebarInstanceId
  items?: ISidebarResource[]
  defaultItems?: ISidebarResource[]
  onItemsChange?: (items: ISidebarResource[]) => void
  /** Reject the promise to roll the optimistic move back. */
  onMove?: (move: ISidebarResourceMove) => void | Promise<void>
  onMoveError?: (error: unknown, move: ISidebarResourceMove) => void
  onRename?: (item: ISidebarResource, label: string) => void | Promise<void>
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
export interface IAISidebarController {
  /** The key this sidebar's state is stored under. */
  sidebarId: TAISidebarInstanceId
  items: ISidebarResource[]
  /** Visible rows in order, each with its depth and parent id. */
  flat: IFlatResource[]
  getItem: (id: string) => ISidebarResource | undefined

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
  move: (move: ISidebarResourceMove) => Promise<void>
  /** A move is in flight — further moves are refused until it settles. */
  movePending: boolean

  /** Live-region text for the last move or rename outcome. */
  announcement: string

  /** Back to the values the sidebar mounted with. */
  reset: () => void

  /** @internal Row wiring the view threads through — drag state, the
   * hover pill and roving keyboard nav all belong to the rendering. */
  dnd: IAISidebarDndState
  hover: IAISidebarHoverState
  onRowKeyDown: (
    event: KeyboardEvent<HTMLDivElement>,
    row: IFlatResource
  ) => void
  setRowRef: (id: string, node: HTMLDivElement | null) => void
}

/** @internal */
export interface IAISidebarDndState extends IAISidebarRowDndHandlers {
  draggingId: string | null
  dropTarget: IDropTarget | null
  onRootDragOver: (event: DragEvent<HTMLDivElement>) => void
}

/** @internal The drag handlers a row needs, stable for the life of the
 * sidebar — they read drag state out of the store when they run instead of
 * closing over it, so handing them to every row costs no re-renders. */
export interface IAISidebarRowDndHandlers {
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onRowDragStart: (event: DragEvent<HTMLDivElement>, id: string) => void
  onRowDragEnd: () => void
  onRowDragOver: (event: DragEvent<HTMLDivElement>, row: IFlatResource) => void
}

/** @internal */
export interface IAISidebarHoverState {
  hoveredId: string | null
  /** Shared motion layoutId that lets the pill travel between rows. */
  layoutId: string
  onRowHover: (id: string, hovered: boolean) => void
  clear: () => void
}

export interface IAISidebarProps extends IUseAISidebarOptions {
  /** Never set on the data form — `controller` selects the other one. */
  controller?: never
  renderIcon?: (item: ISidebarResource) => ReactNode
  renderMenu?: (
    item: ISidebarResource,
    controls: ISidebarResourceMenuControls
  ) => ReactNode
  /**
   * Replaces the default "…" actions button. Must return a single element —
   * the popover clones it to attach its trigger ref and click handler.
   */
  renderActionsTrigger?: (item: ISidebarResource) => ReactElement
  ariaLabel?: string
  className?: string
}

/** Presentational props, shared by both forms of `<AISidebar>`. */
export type TAISidebarViewProps = Pick<
  IAISidebarProps,
  | "renderIcon"
  | "renderMenu"
  | "renderActionsTrigger"
  | "ariaLabel"
  | "className"
>

/** Drive the block from a `useAISidebar` controller instead of raw props —
 * the controller carries the data and every handler. */
export interface IAISidebarControllerProps extends TAISidebarViewProps {
  controller: IAISidebarController
}

/** Either form: raw props, or a `useAISidebar` controller. */
export type TAISidebarComponentProps = IAISidebarProps | IAISidebarControllerProps

export interface IFlatResource {
  item: ISidebarResource
  depth: number
  parentId: string | null
}

export interface IDropTarget {
  id: string | null
  position: TSidebarResourceDropPosition
}

/** A row takes its place in the tree and nothing else: selection,
 * expansion, focus, rename, drag and hover state all arrive through its own
 * atoms, and the rendering options through the sidebar context. */
export interface IResourceRowProps {
  row: IFlatResource
}

/** @internal What a row needs from the block, threaded through context so
 * the rows stay prop-light.
 *
 * Deliberately free of sidebar state and of the controller. Rows read state
 * from per-row atoms, so this value keeps its identity for the life of the
 * sidebar and hovering or expanding one row no longer re-renders every row
 * through context. */
export interface IAISidebarContextValue {
  sidebarId: TAISidebarInstanceId
  /** Shared motion layoutId that lets the hover pill travel between rows. */
  hoverLayoutId: string
  renderIcon?: IAISidebarProps["renderIcon"]
  renderMenu?: IAISidebarProps["renderMenu"]
  renderActionsTrigger?: IAISidebarProps["renderActionsTrigger"]
  /** Registers the row's DOM node with the block, which owns the ref map —
   * DOM nodes never go in the store. */
  setRowRef: (id: string, node: HTMLDivElement | null) => void
  onRowKeyDown: (
    event: KeyboardEvent<HTMLDivElement>,
    row: IFlatResource
  ) => void
  onRowHover: (id: string, hovered: boolean) => void
  /** Closing returns DOM focus to the row that owned the menu, so it goes
   * through the block rather than the store. */
  closeMenu: () => void
  dnd: IAISidebarRowDndHandlers
}

/** Everything observable about one sidebar, for consumers reading it by id. */
export interface IAISidebarState {
  items: ISidebarResource[]
  /** Visible rows in order, each with its depth and parent id. */
  flat: IFlatResource[]
  selectedId: string | null
  expandedIds: ReadonlySet<string>
  focusedId: string | null
  renamingId: string | null
  menuOpenId: string | null
  draggingId: string | null
  dropTarget: IDropTarget | null
  hoveredId: string | null
  /** A move is in flight — further moves are refused until it settles. */
  movePending: boolean
  /** Live-region text for the last move or rename outcome. */
  announcement: string
}

/** Everything doable to one sidebar from outside its component. */
export interface IAISidebarActions {
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
  move: (move: ISidebarResourceMove) => Promise<void>
  setItems: (items: ISidebarResource[]) => void
  reset: () => void
}

/** @internal Projection of `useAISidebar`'s options — primitives only, so
 * the store write runs once per real change instead of once per render. */
export interface IAISidebarConfig {
  controlsItems: boolean
  controlsActiveId: boolean
  controlsExpandedIds: boolean
}

/** @internal Latest option callbacks. Only write atoms read this, so it can
 * be refreshed every commit without re-rendering anything. */
export interface IAISidebarHandlers {
  onItemsChange?: (items: ISidebarResource[]) => void
  onMove?: (move: ISidebarResourceMove) => void | Promise<void>
  onMoveError?: (error: unknown, move: ISidebarResourceMove) => void
  onRename?: (item: ISidebarResource, label: string) => void | Promise<void>
  onActiveChange?: (id: string) => void
  onExpandedChange?: (ids: string[]) => void
}

/** @internal What an instance starts from, replayed by
 * `resetAISidebarAtom`. */
export interface IAISidebarSeed {
  items: ISidebarResource[]
  /** Hook-owned selection — the `defaultActiveId`, never the controlled
   * `activeId`. */
  activeId: string | null
  focusedId: string | null
  expandedIds: string[]
}
