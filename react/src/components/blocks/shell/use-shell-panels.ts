"use client"

import { useCallback, useEffect, useId, useMemo } from "react"
import type { ReactNode } from "react"
import { shellPanelAtoms } from "./shell-panel-atom"
import { useAtomValueRawSync, useSetAtom } from "jotai"

import {
  removeShellFitInstance,
  resizeShellPanelAtom,
  shellFitFitsAtom,
  shellFitStateAtom,
  shellFitPanelWidthAtom,
} from "./shell-fit-atom"
import type {
  TShellPanelControlProps,
  IShellPanelControls,
  TSidebarSide,
  IUseShellPanelsOptions,
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
}: IUseShellPanelsOptions = {}): IShellPanelControls {
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

  const atoms = shellPanelAtoms(shellId)
  const sidebarWidth = useAtomValueRawSync(atoms.railWidth)
  const resizeSidebar = useSetAtom(atoms.resizeSidebar)
  const open = useAtomValueRawSync(atoms.open)
  const openMobile = useAtomValueRawSync(atoms.mobile)
  const setOpen = useSetAtom(atoms.setOpen)
  const setOpenMobile = useSetAtom(atoms.setOpenMobile)
  const toggle = useSetAtom(atoms.toggle)
  const panelComponents = useAtomValueRawSync(atoms.components)
  const setPanelComponents = useSetAtom(atoms.components)

  // Reads false until the shell has measured itself — an unmeasured shell
  // fails open, so nothing out here stands down over a reading that has not
  // happened yet.
  const fits = useAtomValueRawSync(shellFitFitsAtom(shellId))
  const isNarrow = !fits
  const { sidebar } = useAtomValueRawSync(shellFitStateAtom(shellId))
  const panelWidth = useAtomValueRawSync(shellFitPanelWidthAtom(shellId))
  const resizePanel = useSetAtom(resizeShellPanelAtom(shellId))

  const openPanel = useCallback(
    (side: TSidebarSide, component?: ReactNode) => {
      if (component !== undefined) {
        setPanelComponents((prev) =>
          prev[side] === component ? prev : { ...prev, [side]: component }
        )
      }
      setOpen(true, side)
    },
    [setOpen, setPanelComponents]
  )

  const providerProps = useMemo<TShellPanelControlProps>(
    () => ({
      shellId,
      defaultPanelWidth,
      defaultOpen,
      defaultOpenMobile,
      onOpenChange: onPanelChange,
      onOpenMobileChange: onPanelChange,
      panelComponents,
    }),
    [
      shellId,
      defaultPanelWidth,
      defaultOpen,
      defaultOpenMobile,
      onPanelChange,
      panelComponents,
    ]
  )

  return {
    shellId,
    sidebar,
    sidebarWidth,
    resizeSidebar,
    isNarrow,
    panelWidth,
    resizePanel,
    open,
    openMobile,
    setOpen,
    setOpenMobile,
    toggle,
    openPanel,
    providerProps,
  }
}
