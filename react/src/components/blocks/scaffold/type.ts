import React, {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react"

/** Inspector state shared by every scaffold part through ScaffoldContext. */
export interface ScaffoldContextValue {
  /** Whether the inspector drawer is currently shown. */
  inspectorOpen: boolean
  /** Drawer width in px — Actions reads it to slide out of the drawer's way. */
  inspectorWidth: number
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void
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

export interface ScaffoldActionsProps
  extends MotionSafe<Omit<ComponentProps<"div">, "children">> {
  /** Called when the Add segment is pressed. */
  onAdd?: () => void
  /** Label of the Add segment. */
  addLabel?: ReactNode
  /** Replaces the default add icon. */
  addIcon?: ReactNode
  /** Number of non-visible panels tucked into the overflow dropdown —
   * the badge on the browse segment. The segment renders when this or
   * `onBrowse` is present; the badge only when > 0. Per the design
   * comments the dropdown menu itself is a later iteration; for now the
   * segment just keeps the count. */
  overflowCount?: number
  /** Called when the overflow (stacked-panels) segment is pressed. */
  onBrowse?: () => void
  /** Accessible name of the overflow segment. */
  browseLabel?: string
  /** Extra segments appended after the built-in ones. */
  children?: ReactNode
  /** Emit interaction-sound attributes (inert until an app binds cuelume). */
  sound?: boolean
}

export type TScaffoldPanelChild<T extends ScaffoldSubPanelProps = ScaffoldSubPanelProps> = ReactElement<T, React.JSXElementConstructor<T>>

export interface ScaffoldPanelProps {
  /** The panel's content, rendered in a card with a drop shadow. */
  children: ReactNode
  /** The panel's content, rendered in a card with a drop shadow. */
  SecondaryPanel?: TScaffoldPanelChild
  /** Renders the floating close button in the panel's top-right corner. */
  onClose?: () => void
  /** Renders the floating swap button over the primary/secondary gap.
   * Only shown when `secondary` is present. Clicking it trades the two
   * cards with a layout morph — flip the slot content here so each card
   * carries its subject to its new home. */
  onSwap?: () => void
  /** Controlled swap state — while true the strip's card sits in the
   * primary slot. Omit letting the panel toggle it on swap clicks. */
  swapped?: boolean
  /** Initial swap state when uncontrolled. */
  defaultSwapped?: boolean
  /** Fixed width in px; omitted, the panel flexes to share the canvas. */
  width?: number
  /** Accessible name of the panel region. */
  name?: string
  /** Emit interaction-sound attributes on the floating buttons. */
  sound?: boolean
  /** Accessible name of the close button. */
  closeLabel?: string
  /** Accessible name of the swap button. */
  swapLabel?: string
  /** Extra class names for the panel's root element. */
  className?: string
}

export type TSubPanelPosition = "bottom" | "top"
export type TSubPanelVariant = "card" | "subtle" | "inset"

export interface ScaffoldSubPanelProps extends MotionSafe<Omit<ComponentProps<"div">, "children">> {
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

export interface ScaffoldInspectorProps
  extends MotionSafe<Omit<ComponentProps<"aside">, "children">> {
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
  /** Whether the secondary strip currently holds the flexible slot —
   * flips the Expand chevron between down and up. */
  secondaryExpanded?: boolean
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
