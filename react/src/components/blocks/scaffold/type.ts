import React, { type ComponentProps, type ReactElement, type ReactNode, } from "react"

/** Inspector state shared by every scaffold part through ScaffoldContext. */
export interface ScaffoldContextValue {
  /** Whether the inspector drawer is currently shown. */
  inspectorOpen: boolean
  /** Drawer width in px — Actions reads it to slide out of the drawer's way. */
  inspectorWidth: number
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void
  /** How many panels currently fit side by side, from the measured canvas
   * width at `SCAFFOLD_PANEL_MIN_WIDTH` per panel (1..`SCAFFOLD_PANEL_CAPACITY`). */
  panelCapacity: number
  /** Ids of id'd panels the scaffold is currently hiding — auto-hidden by
   * capacity pressure or toggled away from a tab. */
  hiddenPanelIds: readonly string[]
  isPanelHidden: (id: string) => boolean
  /** Show/hide an id'd panel. Showing past capacity auto-hides the
   * least-recently-activated visible panel; the last visible one never hides. */
  togglePanelVisibility: (id: string) => void
  /** Id of the panel whose tab the pointer is resting on — the canvas
   * spotlights it by fading every other id'd panel to 0.35 opacity. */
  hoveredPanelId: string | null
  /** @internal Tabs report pointer enter/leave on their label. */
  setPanelHovered: (id: string, hovered: boolean) => void
  /** @internal Canvas reports its ordered panel ids. */
  registerPanelIds: (ids: readonly string[]) => void
  /** @internal Canvas reports its measured width. */
  setCanvasWidth: (width: number) => void
}

export interface ScaffoldRootProps extends ComponentProps<"div"> {
  /** Controlled inspector state — pair with `onInspectorOpenChange`, or
   * spread `useScaffold().providerProps` instead of wiring by hand. */
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
  /** Initial inspector state. Closed by default. */
  defaultInspectorOpen?: boolean
  /** Fires on every inspector open/close. */
  onInspectorChange?: (open: boolean) => void
}

export interface ScaffoldControls {
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void
  /** Spread onto Scaffold.Root. */
  providerProps: Pick<
    ScaffoldRootProps,
    "inspectorOpen" | "onInspectorOpenChange"
  >
}
