import type { ReactNode } from "react"

import type { PanelFit } from "./use-panel-fit"

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
} from "react"
import type { HTMLMotionProps } from "motion/react"

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
  | "onNarrowChange"
>

export interface UseShellPanelsOptions {
  /** Initial desktop open state per side, merged over
   * `{ left: true, right: false }`. */
  defaultOpen?: AnimatedSidebarProviderProps["defaultOpen"]
  /** Initial mobile overlay state per side — every side starts closed. */
  defaultOpenMobile?: AnimatedSidebarProviderProps["defaultOpenMobile"]
  /** Panel change event returning both the next open state and the side of
   * the panel the change comes from. Mobile overlay changes report the same
   * side as their desktop counterpart. */
  onPanelChange?: (open: boolean, side: TPanelSide) => void
}

export interface ShellPanelControls {
  /** The viewport cannot hold the secondary panel beside the inset's
   * `--sidebar-width` floor, so the shell has dropped the right panel and
   * its trigger — UI outside the shell should stand down with them. The
   * shell measures this itself and reports it back through `providerProps`;
   * it is only ever `true` once the shell is mounted. */
  isNarrow: boolean
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
  fit: PanelFit
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
  /** Fires when the viewport crosses the two-`--sidebar-width` threshold a
   * secondary panel needs. The provider owns the measurement because it owns
   * the variable, so UI above it — a title-bar toggle, a command palette
   * entry — learns of the crossing here instead of measuring again. */
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
