"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useAtomValueRawSync, useSetAtom } from "jotai"
import { useIsomorphicLayoutEffect } from "motion/react"

import {
  measureShellFitAtom,
  mountShellFitAtom,
  removeShellFitInstance,
  resetShellPanelWidthAtom,
  resizeShellPanelAtom,
  shellFitStateAtom,
} from "./shell-fit-atom"
import { fitsPanel, fitSidebar, type IShellMetrics } from "./shell-metrics"
import type {
  IShellFitController,
  IShellFitSeed,
  IUseShellFitOptions,
} from "./type"
import { shellPanelAtoms } from "./shell-panel-atom"
import { resolveLength } from "./utils"

/** Read the shell's columns out of the DOM. The widths come from CSS
 * variables; the rail's share comes from its own state, not its box, so a
 * fold counts the moment React commits it rather than a frame later when the
 * width animation has moved. */
function readMetrics(host: HTMLElement, railOpen: boolean): IShellMetrics {
  // Whether a shell has a rail at all is the caller's composition, so it is
  // read off the DOM rather than tracked in state.
  const rail = host.querySelector<HTMLElement>(
    '[data-slot="sidebar"][data-side="left"]'
  )
  const frame = getComputedStyle(host)
  const gap = Number.parseFloat(frame.columnGap) || 0
  const padding =
    (Number.parseFloat(frame.paddingLeft) || 0) +
    (Number.parseFloat(frame.paddingRight) || 0)
  const width = host.clientWidth || host.getBoundingClientRect().width
  const insetMin = resolveLength(host, "var(--inset-min-width)")
  const sidebar = fitSidebar({
    width,
    padding,
    gap,
    insetMin,
    expanded: resolveLength(host, "var(--sidebar-width)") || 256,
    icon: resolveLength(host, "var(--sidebar-width-icon)") || 56,
    minimum: resolveLength(host, "var(--sidebar-min-width)") || 180,
    open: railOpen,
    collapsible: rail?.dataset.collapsible ?? "icon",
    present: Boolean(rail),
  })
  return {
    rail: sidebar.width,
    sidebar,
    insetMin,
    panelMin: resolveLength(host, "var(--panel-width)"),
    viewport: width,
    // Measure the space a prospective inspector needs, even while absent.
    chrome: padding + gap * (sidebar.width > 0 ? 2 : 1),
  }
}

/**
 * Measures the shell and decides what the secondary panel may do: whether it
 * exists at all, and how wide it may be dragged.
 *
 * Container resizing, rail folding, and user resizing are observed here,
 * so embedded shells obey the same bounds as full-page layouts. The measurement is
 * the only thing this hook keeps to itself: the numbers land in the shell-fit
 * atoms keyed by `shellId`, so anything under `ExegiaProvider` can read the
 * verdict (`useShellFitState`) or move the panel (`useShellFitActions`)
 * without holding this controller.
 */
export function useShellFit({
  shellId: explicitId,
  hostRef,
  railOpen,
  defaultPanelWidth,
  onUnfit,
}: IUseShellFitOptions): IShellFitController {
  // A generated key isolates unnamed shells from each other; an explicit
  // `shellId` is the app's handle on this one.
  const generatedId = useId()
  const shellId = explicitId ?? generatedId
  const railWidth = useAtomValueRawSync(shellPanelAtoms(shellId).railWidth)

  // Read once: `defaultPanelWidth` describes the mount, not every render.
  const [seed] = useState<IShellFitSeed>(() => ({
    panelWidth: defaultPanelWidth ?? null,
  }))

  const mount = useSetAtom(mountShellFitAtom(shellId))
  const measure = useSetAtom(measureShellFitAtom(shellId))
  const resizePanel = useSetAtom(resizeShellPanelAtom(shellId))
  const resetPanelWidth = useSetAtom(resetShellPanelWidthAtom(shellId))

  // Before paint, and before the first measurement below, so a seeded width
  // is in the store by the time the panel first reads its width.
  useIsomorphicLayoutEffect(() => {
    mount(seed)
  }, [mount, seed])

  // The listener below is bound once per fold, so the callback rides a ref
  // rather than rebinding it whenever a consumer passes a fresh arrow.
  const onUnfitRef = useRef(onUnfit)
  useIsomorphicLayoutEffect(() => {
    onUnfitRef.current = onUnfit
  })

  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return

    const takeMeasurement = () => {
      const next = readMetrics(host, railOpen)
      measure(next)
      if (!fitsPanel(next)) onUnfitRef.current?.()
    }

    // Observe the host, including changes from a split view or surrounding
    // navigation that never trigger a window resize.
    takeMeasurement()
    const observer = new ResizeObserver(takeMeasurement)
    observer.observe(host)
    window.addEventListener("resize", takeMeasurement)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", takeMeasurement)
    }
  }, [hostRef, railOpen, railWidth, measure])

  // A shell the hook keyed is scrap once its component goes. An explicit
  // `shellId` is the app's key and outlives the mount — that is what lets a
  // dragged width survive a route change.
  useEffect(() => {
    if (explicitId !== undefined) return
    return () => removeShellFitInstance(shellId)
  }, [shellId, explicitId])

  const state = useAtomValueRawSync(shellFitStateAtom(shellId))

  return useMemo<IShellFitController>(
    () => ({
      shellId,
      ...state,
      defaultPanelWidth: seed.panelWidth,
      resizePanel,
      resetPanelWidth,
    }),
    [shellId, state, seed.panelWidth, resizePanel, resetPanelWidth]
  )
}
