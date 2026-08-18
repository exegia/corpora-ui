import type { ReactNode, RefObject } from "react"

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
} from "react"
import type { HTMLMotionProps } from "motion/react"

import type { ShellMetrics } from "./shell-metrics"

// ---------------------------------------------------------------------------
// Shell fit — the shell's measurement of itself, kept in Jotai atoms keyed by
// `shellId` (see `shell-fit-atom.ts`). No atom imports here: this file stays
// dependency-free so the types can travel without the store.
// ---------------------------------------------------------------------------

/** The key a shell's fit state is filed under. Pass your own to reach it from
 * anywhere (`useShellFitState("app-shell")`); leave it out and the provider
 * generates one that dies with it. */
export type ShellFitInstanceId = string

/** The range a secondary-panel resize may land in, in px. */
export interface ShellFitPanelBounds {
  min: number
  max: number
}

/** What the shell measured of itself — readable by id through
 * `useShellFitState`. */
export interface ShellFitState {
  /** The px the shell last measured, or null before its first measurement
   * (a server render, a host with no layout). */
  metrics: ShellMetrics | null
  /** Whether the shell can hold a secondary panel. True while unmeasured, so
   * a panel never flickers out over a reading that has not happened yet. */
  fits: boolean
  /** The secondary panel's width in px, already clamped to `bounds` — null
   * before the first measurement, where the panel falls back to
   * `--panel-width`. */
  panelWidth: number | null
  /** The range a resize may land in. */
  bounds: ShellFitPanelBounds
}

/** Writes only — drive a shell's secondary panel by id through
 * `useShellFitActions` without re-rendering when it moves. */
export interface ShellFitActions {
  /** Resize the secondary panel. Clamped on the way in, so a drag past the
   * gutter parks at the bound instead of banking travel it has to give back. */
  resizePanel: (width: number) => void
  /** Back to the width the shell mounted with — `defaultPanelWidth`, or
   * `--panel-width` when there was none. */
  resetPanelWidth: () => void
}

/** What `useShellFit` hands the provider: the state, the actions and the id
 * they are filed under. */
export interface ShellFitController extends ShellFitState, ShellFitActions {
  shellId: ShellFitInstanceId
}

export interface UseShellFitOptions {
  /** File the fit under this id so it can be read elsewhere and outlive the
   * shell. Generated (and dropped on unmount) when omitted. */
  shellId?: ShellFitInstanceId
  /** The element the shell's CSS variables live on (the provider wrapper). */
  hostRef: RefObject<HTMLElement | null>
  /** Whether the left rail is expanded right now — a render input, so a fold
   * counts the moment React commits it rather than a frame later when the
   * width animation has moved. */
  railOpen: boolean
  /** The width the secondary panel opens at, in px, instead of
   * `--panel-width`. Read once, on mount. */
  defaultPanelWidth?: number
  /** Fired whenever a measurement lands on "no room": the shell uses it to
   * retire the panel's open state instead of parking it. */
  onUnfit?: () => void
}

/** @internal What an instance starts from, restored by `resetShellPanelWidthAtom`. */
export interface ShellFitSeed {
  /** The requested panel width at mount — null for `--panel-width`. */
  panelWidth: number | null
}

export interface ShellAction {
  id: string
  label: string
  icon: ReactNode
  badge?: ReactNode
  onSelect?: () => void
}

export interface ShellWorkspace {
  name: string
  logo?: ReactNode
  meta?: ReactNode
}

export interface IPanel {
  id: string
  name: string
  component: ReactNode
  /** Replaces the default icon inside the panel's header trigger. The shell
   * keeps the trigger button itself (toggle wiring, aria-label) — this only
   * swaps what renders inside it. */
  trigger?: ReactNode
  open: boolean
  defaultOpen?: boolean
  side: "left" | "bottom" | "right" | "sidebar"
}

/** The side a panel docks to, as a value union (`IPanel["side"]`).
 * `Pick<IPanel, "side">` would be the object type `{ side: ... }`, which can
 * neither key a Record nor travel as a plain callback argument. */
export type TPanelSide = IPanel["side"]

/** Panel content keyed by the side it docks to. `Side` narrows the map to
 * the sides a surface actually renders (the shell renders left and right).
 * Entries are optional — a shell with no bottom dock simply has no `bottom`
 * key. Where an entry's own `side` field disagrees with its key, the key
 * wins. */
export type TPanelMap<Side extends TPanelSide = TPanelSide> = Partial<
  Record<Side, IPanel>
>

/** The open/close surface of the shell's panels, lifted straight from
 * AnimatedPanelProvider — every prop is keyed by side, there are no
 * explicit per-side props. `useShellPanels` produces the controlled subset
 * of these as `providerProps`. */
export type ShellPanelControlProps = Pick<
  AnimatedSidebarProviderProps,
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "openMobile"
  | "defaultOpenMobile"
  | "onOpenMobileChange"
  | "shellId"
  | "defaultPanelWidth"
>

export interface UseShellPanelsOptions {
  /** The id the shell's fit state is filed under. Name it to read the same
   * shell from elsewhere (`useShellFitState("app-shell")`) and to keep a
   * dragged panel width across a route change; otherwise the hook generates
   * one that dies with it. */
  shellId?: ShellFitInstanceId
  /** Initial desktop open state per side, merged over
   * `{ left: true, right: false }`. */
  defaultOpen?: AnimatedSidebarProviderProps["defaultOpen"]
  /** Initial mobile overlay state per side — every side starts closed. */
  defaultOpenMobile?: AnimatedSidebarProviderProps["defaultOpenMobile"]
  /** The width the secondary panel opens at, in px, instead of
   * `--panel-width`. */
  defaultPanelWidth?: number
  /** Panel change event returning both the next open state and the side of
   * the panel the change comes from. Mobile overlay changes report the same
   * side as their desktop counterpart. */
  onPanelChange?: (open: boolean, side: TPanelSide) => void
}

export interface ShellPanelControls {
  /** The id the shell's fit state is filed under — hand it to
   * `useShellFitState` / `useShellFitActions` anywhere below `ExegiaProvider`. */
  shellId: ShellFitInstanceId
  /** The viewport cannot hold the secondary panel beside the rail and the
   * body at their floors, so the shell has dropped the right panel and its
   * trigger — UI outside the shell should stand down with them. Read straight
   * out of the shell's fit atoms; it is only ever `true` once the shell is
   * mounted and measured. */
  isNarrow: boolean
  /** The secondary panel's current width in px, or null until the shell has
   * measured itself (the panel then sits at `--panel-width`). */
  panelWidth: number | null
  /** Resize the secondary panel from outside the shell — clamped to the room
   * the shell has. */
  resizePanel: (width: number) => void
  /** Live desktop open state, keyed by side. */
  open: Record<SidebarSide, boolean>
  /** Live mobile overlay state, keyed by side. */
  openMobile: Record<SidebarSide, boolean>
  /** Refuses to OPEN the right panel while `isNarrow` — there is nothing on
   * screen to open. Closing it always goes through. */
  setOpen: (open: boolean, side: SidebarSide) => void
  setOpenMobile: (open: boolean, side: SidebarSide) => void
  /** Desktop-only convenience — the in-shell triggers already pick the
   * mobile state themselves when the viewport is narrow. Carries the same
   * `isNarrow` refusal as `setOpen`. */
  toggle: (side: SidebarSide) => void
  /** Spread onto ShellLayout (or AnimatedPanelProvider directly). */
  providerProps: ShellPanelControlProps
}

export interface ShellLayoutProps extends ShellPanelControlProps {
  children?: ReactNode
  /** Content for the shell's panels, keyed by the side. The shell renders
   * the `left` rail and the `right` drawer; other sides are reserved. */
  panels?: TPanelMap
  header?: ReactNode
  className?: string
  variant?: "web" | "desktop"
}

export type SidebarSide = "left" | "right"
/** Open flags keyed by the side. Sides left out stay uncontrolled / at their
 * default — there is no per-side prop, the record IS the API. */
export type SidebarOpenState = Partial<Record<SidebarSide, boolean>>
export type SidebarVariant = "sidebar" | "floating" | "inset"
export type SidebarCollapsible = "offcanvas" | "icon" | "none"

export interface AnimatedSidebarContextValue {
  isMobile: boolean
  /** What the shell measured of itself: whether it can hold a secondary panel
   * at all, how wide that panel is, and the range a resize may land in. The
   * right panel and its trigger stand down when `fit.fits` is false. */
  fit: ShellFitController
  layoutId: string
  /** Desktop open state, keyed by side. */
  open: Record<SidebarSide, boolean>
  /** Mobile overlay open state, keyed by side. */
  openMobile: Record<SidebarSide, boolean>
  reduce: boolean
  setOpen: (open: boolean, side: SidebarSide) => void
  setOpenMobile: (open: boolean, side: SidebarSide) => void
  /** Mobile-aware: toggles the overlay below md, the docked panel above. */
  toggleSidebar: (side: SidebarSide) => void
  triggerRefs: Record<SidebarSide, React.RefObject<HTMLButtonElement | null>>
}

export interface AnimatedSidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** The id this shell's fit state (whether a secondary panel fits, how wide
   * it is) is filed under in the store. Name it to read or drive the shell
   * from elsewhere and to keep a dragged width across a route change; omit it
   * and the provider generates one that is dropped on unmount. */
  shellId?: ShellFitInstanceId
  /** The width the secondary panel opens at, in px, instead of
   * `--panel-width`. Read once, on mount. */
  defaultPanelWidth?: number
  /** Controlled desktop open state, keyed by the side. A side left undefined
   * stays uncontrolled. */
  open?: SidebarOpenState
  /** Initial desktop open state, merged over `{ left: true, right: false }`. */
  defaultOpen?: SidebarOpenState
  onOpenChange?: (open: boolean, side: SidebarSide) => void
  /** Controlled mobile overlay state, keyed by side. */
  openMobile?: SidebarOpenState
  /** Initial mobile overlay state — every side starts closed. */
  defaultOpenMobile?: SidebarOpenState
  onOpenMobileChange?: (open: boolean, side: SidebarSide) => void
  /** Fires when the shell crosses the width a secondary panel needs (rail +
   * body + panel at their floors). An imperative escape hatch for a consumer
   * that mounts the provider on its own; anything under `ExegiaProvider` can
   * subscribe by id instead with `useShellFitState(shellId).fits`. */
  onNarrowChange?: (isNarrow: boolean) => void
  style?: SidebarProviderStyle
}

export type SidebarProviderStyle = CSSProperties & {
  /** Left rail, expanded. */
  "--sidebar-width"?: string
  /** Left rail, folded to icons. */
  "--sidebar-width-icon"?: string
  "--sidebar-width-mobile"?: string
  /** The secondary panel's floor, and the width it opens at. */
  "--panel-width"?: string
  /** The body's floor — the secondary panel may never squeeze it past this. */
  "--inset-min-width"?: string
}

export type AnimatedSidebarInsetProps = HTMLMotionProps<"main">

export interface AnimatedSidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  side?: SidebarSide
}

export interface AnimatedSidebarPanelContextValue {
  collapsed: boolean
  collapsible: SidebarCollapsible
  side: SidebarSide
}

export interface AnimatedSidebarProps extends Omit<
  HTMLMotionProps<"aside">,
  "children"
> {
  children?: ReactNode
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
  ariaLabel?: string
  panelClassName?: string
}

export interface AnimatedSidebarMenuSubProps extends Omit<
  HTMLMotionProps<"ul">,
  "children"
> {
  open: boolean
  children?: ReactNode
}

export interface AnimatedSidebarMenuSubButtonProps {
  children: ReactNode
  icon?: ReactNode
  href?: string
  isActive?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  target?: "_blank" | "_self" | "_parent" | "_top"
  rel?: string
  onSelect?: () => void
  className?: string
}

export interface AnimatedSidebarMenuButtonProps {
  children: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  href?: string
  isActive?: boolean
  ariaExpanded?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  target?: "_blank" | "_self" | "_parent" | "_top"
  rel?: string
  onSelect?: () => void
  className?: string
}
