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
 *
 * `providerProps` is also the way back down: the shell measures whether the
 * viewport can still hold the secondary panel and reports it here as
 * `isNarrow`, so outside UI stands down with the panel instead of measuring
 * `--sidebar-width` a second time.
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
  // Starts false and only ever moves once the shell has measured itself:
  // this hook renders above the provider, so it cannot read the context and
  // has no element to resolve `--sidebar-width` against.
  const [isNarrow, setIsNarrow] = useState(false)

  // The shell drops the right panel when the viewport cannot hold it, so
  // opening it from out here would only surface later as a panel nobody
  // asked for. Closing always goes through — that is how state left over
  // from a wider viewport clears.
  const setOpen = useCallback(
    (nextOpen: boolean, side: SidebarSide) => {
      if (nextOpen && side === "right" && isNarrow) return

      setOpenState((prev) =>
        prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
      )
      onPanelChange?.(nextOpen, side)
    },
    [isNarrow, onPanelChange]
  )

  const setOpenMobile = useCallback(
    (nextOpen: boolean, side: SidebarSide) => {
      if (nextOpen && side === "right" && isNarrow) return

      setOpenMobileState((prev) =>
        prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
      )
      onPanelChange?.(nextOpen, side)
    },
    [isNarrow, onPanelChange]
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
      // A stable setter, so mirroring the shell's verdict never re-identifies
      // providerProps.
      onNarrowChange: setIsNarrow,
    }),
    [open, openMobile, setOpen, setOpenMobile]
  )

  return {
    isNarrow,
    open,
    openMobile,
    setOpen,
    setOpenMobile,
    toggle,
    providerProps,
  }
}
