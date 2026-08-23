import React, { type ComponentProps, type ReactElement, type ReactNode, } from "react"

/** Key of one scaffold's slice of the store. */
export type ScaffoldInstanceId = string

/** The identity every scaffold part shares through ScaffoldContext. State
 * itself lives in the store — parts subscribe to the atoms they render from,
 * so this value never changes identity while the scaffold is mounted. */
export interface ScaffoldContextValue {
  scaffoldId: ScaffoldInstanceId
  /** Drawer width in px — Actions reads it to slide out of the drawer's way. */
  inspectorWidth: number
}

/** One scaffold's whole state, as `useScaffoldState` returns it. A component
 * that watches one field should subscribe to that field's atom instead. */
export interface ScaffoldState {
  /** Whether the inspector drawer is currently shown. */
  inspectorOpen: boolean
  /** How many panels currently fit side by side, from the measured canvas
   * width at `SCAFFOLD_PANEL_MIN_WIDTH` per panel (1..`SCAFFOLD_PANEL_CAPACITY`). */
  panelCapacity: number
  /** Ids of id'd panels the scaffold is currently hiding — auto-hidden by
   * capacity pressure or toggled away from a tab. */
  hiddenPanelIds: readonly string[]
  /** Id of the panel whose tab the pointer is resting on — the canvas
   * spotlights it by fading every other id'd panel to 0.35 opacity. */
  hoveredPanelId: string | null
}

/** Drive a scaffold by id from anywhere, as `useScaffoldActions` returns it. */
export interface ScaffoldStateActions {
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void
  /** Show/hide an id'd panel. Showing past capacity auto-hides the
   * least-recently-activated visible panel; the last visible one never hides. */
  togglePanel: (panelId: string) => void
  reset: () => void
}

/** @internal Which props currently control the scaffold — write gates for
 * the action atoms, so the store never overwrites a prop. */
export interface ScaffoldConfig {
  controlsInspector: boolean
}

/** @internal The mounted root's callbacks, published into the store so
 * action atoms can report changes wherever they were fired from. */
export interface ScaffoldHandlers {
  onInspectorOpenChange?: (open: boolean) => void
}

/** @internal Bookkeeping for responsive panel hiding.
 * - `visibleOrder`: visible panel ids, least-recently-activated first — the
 *   front is what capacity pressure evicts next.
 * - `autoHidden`: panels the scaffold hid because the canvas shrank, most
 *   recent last. They return on their own when room comes back.
 * - `userHidden`: panels hidden by a tab press. They stay hidden until the
 *   tab is pressed again, however wide the canvas grows. */
export interface ScaffoldPanelVisibility {
  visibleOrder: string[]
  autoHidden: string[]
  userHidden: string[]
}

export interface ScaffoldRootProps extends ComponentProps<"div"> {
  /** Names this scaffold's slice of the store, so `useScaffoldState` /
   * `useScaffoldActions` can drive it by id and its state outlives the
   * component. Omitted, the root keys off `useId` and drops its state on
   * unmount. `useScaffold().providerProps` carries one. */
  scaffoldId?: ScaffoldInstanceId
  /** Controlled inspector state — pair with `onInspectorOpenChange`. The
   * prop stays the source of truth: store writes are gated off, and actions
   * report through the callback instead. */
  inspectorOpen?: boolean
  /** Initial inspector state when uncontrolled. Closed by default. */
  defaultInspectorOpen?: boolean
  onInspectorOpenChange?: (open: boolean) => void
  /** Drawer width in px. Also drives how far Actions slides aside. */
  inspectorWidth?: number
}

export type ScaffoldSidebarProps = ComponentProps<"nav">

export type ScaffoldMainProps = ComponentProps<"div">

export type ScaffoldCanvasProps = ComponentProps<"div">

/** React's drag/animation DOM handlers collide with motion's gesture props
 * on `motion.*` elements — strip them from pass-through HTML props. */
type MotionSafe<T> = Omit<
  T,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>

export interface ScaffoldActionsProps extends MotionSafe<
  Omit<ComponentProps<"div">, "children">
> {
  /** Called when the Add segment is pressed. The segment renders only
   * while this is present — omit it to hide Add, e.g. once the canvas
   * holds `SCAFFOLD_PANEL_CAPACITY` panels. */
  onAdd?: () => void
  /** Label of the Add segment. */
  addLabel?: ReactNode
  /** Replaces the default add icon. */
  addIcon?: ReactNode
  /** The panel tabs (`Scaffold.Tab`, one per open panel) and any extra
   * segments, rendered before Add. Key each tab — closes animate out. */
  children?: ReactNode
  /** Emit interaction-sound attributes (inert until an app binds cuelume). */
  sound?: boolean
}

export type TScaffoldPanelChild<
  T extends ScaffoldSubPanelProps = ScaffoldSubPanelProps,
> = ReactElement<T, React.JSXElementConstructor<T>>

export interface ScaffoldPanelProps {
  /** Stable id opting the panel into responsive hiding: the canvas hides
   * id'd panels when it can't grant each `SCAFFOLD_PANEL_MIN_WIDTH`, and a
   * `Scaffold.Tab` with the matching `panelId` reflects and toggles it.
   * Omitted, the panel always renders. */
  id?: string
  /** The panel's content, rendered in a card with a drop shadow. */
  children: ReactNode
  /** The panel's content, rendered in a card with a drop shadow. */
  SecondaryPanel?: TScaffoldPanelChild
  /** Reveals the Swap action in the seam menu (needs `SecondaryPanel`).
   * Swapping trades the two cards with a layout morph — flip the slot
   * content here so each card carries its subject to its new home. */
  onSwap?: () => void
  /** Reveals the Close action in the seam menu — remove `SecondaryPanel`
   * here; the strip and the menu leave together. */
  onCloseSecondary?: () => void
  /** Accessible name of the panel region. */
  name?: string
  /** Emit interaction-sound attributes on the floating buttons. */
  sound?: boolean
  /** Accessible name of the seam-menu toggle. */
  swapLabel?: string
  /** Extra class names for the panel's root element. */
  className?: string
}

export interface ScaffoldTabProps extends MotionSafe<
  Omit<ComponentProps<"div">, "children">
> {
  /** The tab's label. */
  children?: ReactNode
  /** Id of the panel this tab fronts (`Scaffold.Panel`'s `id`). The tab
   * then shows whether the panel is hidden and pressing its label toggles
   * visibility — showing past capacity hides another panel in its place. */
  panelId?: string
  /** Renders the tab's close button. The button renders only while this
   * is present — omit it to pin the tab, e.g. on the last remaining
   * panel (the canvas keeps at least one open). */
  onClose?: () => void
  /** Accessible name of the close button. */
  closeLabel?: string
  /** Emit interaction-sound attributes on the close button. */
  sound?: boolean
}

export type TSubPanelPosition = "bottom" | "top"
export type TSubPanelVariant = "card" | "subtle" | "inset"

export interface ScaffoldSubPanelProps extends MotionSafe<
  Omit<ComponentProps<"div">, "children">
> {
  children?: ReactNode
  /** Accessible name of the sub-panel region. */
  name?: string
  /** Whether this is the primary or secondary sub-panel. */
  primary?: boolean
  /** Whether this sub-panel holds the flexible slot. Defaults to `primary` —
   * the panel flips it when the Expand action trades the slots. */
  expanded?: boolean
  /** Visual style of the sub-panel. */
  variant?: TSubPanelVariant
  /** Fixed width in px; omitted, the sub-panel flexes to share the canvas. */
  width?: number
  /** Emit interaction-sound attributes on the floating buttons. */
  sound?: boolean
  /** Extra class names for the sub-panel's root element. */
  className?: string
}

export interface ScaffoldInspectorProps extends MotionSafe<
  Omit<ComponentProps<"aside">, "children">
> {
  children?: ReactNode
  /** Accessible name of the drawer region. */
  name?: string
}

export interface PanelFloatingButtonProps {
  onClick?: () => void
  /** Accessible name — the button is icon-only. */
  label: string
  sound?: boolean
  className?: string
}

export interface PanelMenuButtonProps extends PanelFloatingButtonProps {
  /** Called when the Expand action is pressed — the panel trades which
   * sub-panel holds the flexible slot. */
  onExpand?: () => void
  /** Renders the Close action; called when it is pressed — the consumer
   * removes the secondary strip. */
  onCloseSecondary?: () => void
  /** Whether the secondary strip currently holds the flexible slot —
   * flips the Expand chevron between down and up. */
  secondaryExpanded?: boolean
  /** Whether the panel is swapped (column-reverse). Mirrors the Expand
   * chevron so it keeps pointing at the sub-panel that grows next. */
  swapped?: boolean
}

export interface UseScaffoldOptions {
  /** Names the scaffold's slice of the store. Omitted, the hook generates
   * one and drops its state on unmount. */
  scaffoldId?: ScaffoldInstanceId
  /** Initial inspector state. Closed by default. */
  defaultInspectorOpen?: boolean
  /** Fires on every inspector open/close. */
  onInspectorChange?: (open: boolean) => void
}

export interface ScaffoldControls {
  /** The id the hook and the root share — hand it to `useScaffoldState` /
   * `useScaffoldActions` to drive the scaffold from elsewhere. */
  scaffoldId: ScaffoldInstanceId
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void
  /** Spread onto Scaffold.Root. */
  providerProps: Pick<
    ScaffoldRootProps,
    "scaffoldId" | "defaultInspectorOpen" | "onInspectorOpenChange"
  >
}
