"use client"

import { useCallback, useMemo, useState } from "react"

import type {
  ShellPanelControlProps,
  ShellPanelControls,
  SidebarSide,
  UseShellPanelsOptions,
} from "./type"

/**
 * Owns the open/close state of the shell's panels, keyed by side, and
 * reports every change through a single `onPanelChange(open, side)`
 * callback. Spread the returned `providerProps` onto ShellLayout; the
 * setters and `toggle` are for UI that lives outside the shell (title-bar
 * buttons, command palette, shortcuts).
 */
export function useShellPanels({
  defaultOpen,
  defaultOpenMobile,
  onPanelChange,
}: UseShellPanelsOptions = {}): ShellPanelControls {
  const [open, setOpenState] = useState<Record<SidebarSide, boolean>>(() => ({
    left: defaultOpen?.left ?? true,
    right: defaultOpen?.right ?? false,
  }))
  const [openMobile, setOpenMobileState] = useState<
    Record<SidebarSide, boolean>
  >(() => ({
    left: defaultOpenMobile?.left ?? false,
    right: defaultOpenMobile?.right ?? false,
  }))

  const setOpen = useCallback(
    (nextOpen: boolean, side: SidebarSide) => {
      setOpenState((prev) =>
        prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
      )
      onPanelChange?.(nextOpen, side)
    },
    [onPanelChange]
  )

  const setOpenMobile = useCallback(
    (nextOpen: boolean, side: SidebarSide) => {
      setOpenMobileState((prev) =>
        prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
      )
      onPanelChange?.(nextOpen, side)
    },
    [onPanelChange]
  )

  const toggle = useCallback(
    (side: SidebarSide) => setOpen(!open[side], side),
    [open, setOpen]
  )

  const providerProps = useMemo<ShellPanelControlProps>(
    () => ({
      open,
      onOpenChange: setOpen,
      openMobile,
      onOpenMobileChange: setOpenMobile,
    }),
    [open, openMobile, setOpen, setOpenMobile]
  )

  return {
    open,
    openMobile,
    setOpen,
    setOpenMobile,
    toggle,
    providerProps,
  }
}
