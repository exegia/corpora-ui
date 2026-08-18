export const TITLE_BAR_HEIGHT = 48
// The desktop rail settles at a hard zero-width boundary. Keep the spring
// critically damped so it cannot overshoot, pause against that boundary, and
// then snap back during the final frame.
import { EASE_OUT, EASE_DRAWER } from "@/lib/ease.ts"
import type { Variants } from "motion/react"
import { createContext, useContext, useSyncExternalStore } from "react"
import type {
  AnimatedSidebarContextValue,
  AnimatedSidebarPanelContextValue,
} from "./type"

export const SIDEBAR_MORPH_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 35,
  mass: 0.75,
} as const

export const LABEL_ENTER_TRANSITION = {
  duration: 0.2,
  delay: 0.08,
  ease: EASE_OUT,
} as const

export const LABEL_EXIT_TRANSITION = {
  duration: 0.12,
  ease: EASE_OUT,
} as const

export const PANEL_TRANSITION = {
  duration: 0.36,
  ease: EASE_DRAWER,
} as const

export const REDUCED_TRANSITION = {
  duration: 0.16,
  ease: EASE_OUT,
} as const

const SUBMENU_TRANSITION = {
  duration: 0.18,
  ease: EASE_OUT,
} as const

export const SUBMENU_VARIANTS: Variants = {
  closed: {
    opacity: 0,
    clipPath: "inset(0 0 100% 0 round 8px)",
    transition: {
      duration: 0.14,
      ease: EASE_OUT,
      staggerChildren: 0.025,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0 round 8px)",
    transition: {
      duration: 0.2,
      delayChildren: 0.035,
      ease: EASE_OUT,
      staggerChildren: 0.045,
    },
  },
}

export const SUBMENU_ITEM_VARIANTS: Variants = {
  closed: {
    opacity: 0,
    y: -6,
    filter: "blur(3px)",
  },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: SUBMENU_TRANSITION,
  },
}

export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

export const MOBILE_QUERY = "(max-width: 767px)"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

/**
 * The shell's layout contract, in px. Every entry lands on the provider's
 * wrapper as a CSS variable, so a consumer overrides a column by restyling it
 * rather than by passing a prop:
 *
 * | variable               | column                                    |
 * | ---------------------- | ----------------------------------------- |
 * | `--sidebar-width`      | left rail, expanded                       |
 * | `--sidebar-width-icon` | left rail, folded to icons                |
 * | `--panel-width`        | secondary panel: its floor AND its default |
 * | `--inset-min-width`    | the body's floor                          |
 *
 * These are only the defaults. Every measurement resolves the live variable,
 * so an override wins over the value written here.
 */
export const SHELL_WIDTHS = {
  "--sidebar-width": "256px",
  "--sidebar-width-icon": "56px",
  "--sidebar-width-mobile": "18rem",
  "--panel-width": "320px",
  "--inset-min-width": "360px",
} as const

/** The expanded width of a panel docked to `side`: the secondary panel opens
 * at `--panel-width`, the primary rail at `--sidebar-width`. */
export function expandedWidthVar(side: "left" | "right") {
  return side === "right" ? "var(--panel-width)" : "var(--sidebar-width)"
}

/** Resolve a CSS length — `var()` included — to px inside `host`'s cascade.
 * Custom properties inherit, so a throwaway probe mounted in `host` reads the
 * very `--sidebar-width` the shell lays out with, including a value a
 * consumer overrode on the provider. Returns 0 when `host` has no layout
 * (server render, `display: none`), so callers must fail open on 0 rather
 * than treat it as a real measurement. */
export function resolveLength(host: HTMLElement, value: string) {
  const probe = document.createElement("div")
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${value}`
  host.appendChild(probe)
  const px = probe.getBoundingClientRect().width
  probe.remove()
  return px
}

export const AnimatedSidebarContext =
  createContext<AnimatedSidebarContextValue | null>(null)

export const AnimatedSidebarPanelContext =
  createContext<AnimatedSidebarPanelContextValue | null>(null)

export function useAnimatedSidebar() {
  const context = useContext(AnimatedSidebarContext)
  if (!context) {
    throw new Error(
      "useAnimatedSidebar must be used inside AnimatedPanelProvider."
    )
  }
  return context
}

function subscribeToMobileQuery(callback: () => void) {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}

export function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

export function getServerMobileSnapshot() {
  return false
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getServerMobileSnapshot
  )
}

export function useAnimatedSidebarPanel() {
  const context = useContext(AnimatedSidebarPanelContext)
  if (!context) {
    throw new Error("Animated Sidebar parts must be used inside AnimatedPanel.")
  }
  return context
}
