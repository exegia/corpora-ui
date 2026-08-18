"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { useIsomorphicLayoutEffect } from "motion/react"

import {
  measureShellFitAtom,
  mountShellFitAtom,
  removeShellFitInstance,
  resetShellPanelWidthAtom,
  resizeShellPanelAtom,
  shellFitStateAtom,
} from "./shell-fit-atom"
import { fitsPanel, type ShellMetrics } from "./shell-metrics"
import type {
  ShellFitController,
  ShellFitSeed,
  UseShellFitOptions,
} from "./type"
import { resolveLength } from "./utils"

/** Read the shell's columns out of the DOM. The widths come from CSS
 * variables; the rail's share comes from its own state, not its box, so a
 * fold counts the moment React commits it rather than a frame later when the
 * width animation has moved. */
function readMetrics(host: HTMLElement, railOpen: boolean): ShellMetrics {
  // Whether a shell has a rail at all is the caller's composition, so it is
  // read off the DOM rather than tracked in state.
  const rail = host.querySelector<HTMLElement>(
    '[data-slot="sidebar"][data-side="left"]'
  )
  const collapsible = rail?.dataset.collapsible

  const frame = getComputedStyle(host)
  const gap = Number.parseFloat(frame.columnGap) || 0

  return {
    rail: !rail
      ? 0
      : railOpen || collapsible === "none"
        ? resolveLength(host, "var(--sidebar-width)")
        : collapsible === "offcanvas"
          ? 0
          : resolveLength(host, "var(--sidebar-width-icon)"),
    insetMin: resolveLength(host, "var(--inset-min-width)"),
    panelMin: resolveLength(host, "var(--panel-width)"),
    viewport: window.innerWidth,
    chrome:
      (Number.parseFloat(frame.paddingLeft) || 0) +
      (Number.parseFloat(frame.paddingRight) || 0) +
      gap * Math.max(0, host.children.length - 1),
  }
}

/**
 * Measures the shell and decides what the secondary panel may do: whether it
 * exists at all, and how wide it may be dragged.
 *
 * The three things that move the answer are all observed here — the viewport
 * (`resize`), the rail's fold (`railOpen`, a render input) and the user's own
 * drag (`resizePanel`) — so no caller has to re-derive it. The measurement is
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
}: UseShellFitOptions): ShellFitController {
  // A generated key isolates unnamed shells from each other; an explicit
  // `shellId` is the app's handle on this one.
  const generatedId = useId()
  const shellId = explicitId ?? generatedId

  // Read once: `defaultPanelWidth` describes the mount, not every render.
  const [seed] = useState<ShellFitSeed>(() => ({
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

    // Measured before paint so a shell that cannot hold the panel never
    // flashes one, and re-measured on every fold because the rail's column is
    // part of the room the panel needs.
    takeMeasurement()
    window.addEventListener("resize", takeMeasurement)
    return () => window.removeEventListener("resize", takeMeasurement)
  }, [hostRef, railOpen, measure])

  // A shell the hook keyed is scrap once its component goes. An explicit
  // `shellId` is the app's key and outlives the mount — that is what lets a
  // dragged width survive a route change.
  useEffect(() => {
    if (explicitId !== undefined) return
    return () => removeShellFitInstance(shellId)
  }, [shellId, explicitId])

  const state = useAtomValue(shellFitStateAtom(shellId))

  return useMemo<ShellFitController>(
    () => ({ shellId, ...state, resizePanel, resetPanelWidth }),
    [shellId, state, resizePanel, resetPanelWidth]
  )
}
