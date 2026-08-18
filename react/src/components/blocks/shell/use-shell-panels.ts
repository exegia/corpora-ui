"use client"

import { useCallback, useEffect, useId, useMemo, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  removeShellFitInstance,
  resizeShellPanelAtom,
  shellFitFitsAtom,
  shellFitPanelWidthAtom,
} from "./shell-fit-atom"
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
 * The way back down is the store: `providerProps` carries a `shellId`, the
 * shell files its measurement under it, and this hook reads `isNarrow` and
 * `panelWidth` straight out of those atoms — so outside UI stands down with
 * the panel instead of measuring `--sidebar-width` a second time. Name the
 * `shellId` and any component below `ExegiaProvider` can do the same with
 * `useShellFitState(shellId)`.
 *
 * Call it under the same `ExegiaProvider` as the shell it drives (or under
 * none at all, on both sides): mounted above the provider it would read
 * Jotai's default store while the shell writes to the provider's.
 */
export function useShellPanels({
  shellId: explicitId,
  defaultOpen,
  defaultOpenMobile,
  defaultPanelWidth,
  onPanelChange,
}: UseShellPanelsOptions = {}): ShellPanelControls {
  // The hook, not the provider, keys the shell: it renders above the provider
  // and has to read the same atoms the provider writes. Whoever generates the
  // key drops it — the provider treats a passed-in id as the app's and leaves
  // it alone on unmount.
  const generatedId = useId()
  const shellId = explicitId ?? generatedId
  useEffect(() => {
    if (explicitId !== undefined) return
    return () => removeShellFitInstance(shellId)
  }, [shellId, explicitId])

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

  // Reads false until the shell has measured itself — an unmeasured shell
  // fails open, so nothing out here stands down over a reading that has not
  // happened yet.
  const fits = useAtomValue(shellFitFitsAtom(shellId))
  const isNarrow = !fits
  const panelWidth = useAtomValue(shellFitPanelWidthAtom(shellId))
  const resizePanel = useSetAtom(resizeShellPanelAtom(shellId))

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
      shellId,
      defaultPanelWidth,
      open,
      onOpenChange: setOpen,
      openMobile,
      onOpenMobileChange: setOpenMobile,
    }),
    [shellId, defaultPanelWidth, open, openMobile, setOpen, setOpenMobile]
  )

  return {
    shellId,
    isNarrow,
    panelWidth,
    resizePanel,
    open,
    openMobile,
    setOpen,
    setOpenMobile,
    toggle,
    providerProps,
  }
}
