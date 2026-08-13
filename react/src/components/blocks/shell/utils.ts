export const TITLE_BAR_HEIGHT = 48
// The desktop rail settles at a hard zero-width boundary. Keep the spring
// critically damped so it cannot overshoot, pause against that boundary, and
// then snap back during the final frame.
import { EASE_OUT, EASE_DRAWER } from "@/lib/ease.ts"
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
    throw new Error(
      "Animated Sidebar parts must be used inside AnimatedPanel."
    )
  }
  return context
}
