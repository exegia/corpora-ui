"use client"

import { useCallback, useRef, useState, type RefObject } from "react"
import { useIsomorphicLayoutEffect } from "motion/react"

import {
  clampPanelWidth,
  fitsPanel,
  metricsEqual,
  panelBounds,
  type ShellMetrics,
} from "./shell-metrics"
import { resolveLength } from "./utils"

export interface PanelFit {
  /** The px the shell last measured, or null before its first measurement
   * (a server render). */
  metrics: ShellMetrics | null
  /** Whether the shell can hold a secondary panel. True while unmeasured, so
   * a panel never flickers out over a reading that has not happened yet. */
  fits: boolean
  /** The secondary panel's width in px, already clamped to `bounds` — null
   * before the first measurement, where the caller falls back to the CSS
   * variable. */
  panelWidth: number | null
  /** The range a resize may land in. */
  bounds: { min: number; max: number }
  /** Resize the secondary panel. Clamped on the way in, so a drag past the
   * gutter parks at the bound instead of banking travel it has to give back. */
  resizePanel: (width: number) => void
  /** Drop back to `--panel-width`. */
  resetPanelWidth: () => void
}

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
 * drag (`resizePanel`) — so no caller has to re-derive it.
 *
 * @param hostRef the element the CSS variables live on (the provider wrapper)
 * @param railOpen whether the left rail is expanded right now
 * @param onUnfit fired whenever a measurement lands on "no room": the shell
 *   uses it to retire the panel's open state instead of parking it
 */
export function usePanelFit(
  hostRef: RefObject<HTMLElement | null>,
  railOpen: boolean,
  onUnfit?: () => void
): PanelFit {
  const [metrics, setMetrics] = useState<ShellMetrics | null>(null)
  // The width the user dragged to, before clamping. Kept separate from the
  // clamped read so a viewport that narrows and widens again restores the
  // width they chose rather than the squeezed one.
  const [requestedWidth, setRequestedWidth] = useState<number | null>(null)

  // `measure` runs off a listener bound once, so anything it needs beyond its
  // arguments rides a ref.
  const metricsRef = useRef<ShellMetrics | null>(null)
  const onUnfitRef = useRef(onUnfit)
  useIsomorphicLayoutEffect(() => {
    onUnfitRef.current = onUnfit
  })

  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return

    const measure = () => {
      const next = readMetrics(host, railOpen)
      metricsRef.current = next
      setMetrics((previous) =>
        previous && metricsEqual(previous, next) ? previous : next
      )
      if (!fitsPanel(next)) onUnfitRef.current?.()
    }

    // Measured before paint so a shell that cannot hold the panel never
    // flashes one, and re-measured on every fold because the rail's column is
    // part of the room the panel needs.
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [hostRef, railOpen])

  const resizePanel = useCallback((width: number) => {
    const current = metricsRef.current
    setRequestedWidth(current ? clampPanelWidth(width, current) : width)
  }, [])

  const resetPanelWidth = useCallback(() => setRequestedWidth(null), [])

  // A shell with no layout (server render, `display: none`, a test with no
  // layout engine) reports zeroes, and a zero is not a width: the panel keeps
  // the CSS variable rather than being pinned to nothing.
  const measured = metrics && metrics.panelMin > 0 ? metrics : null

  return {
    metrics,
    fits: metrics ? fitsPanel(metrics) : true,
    // Clamped again on read: the room can shrink under a width nobody
    // touched, and the panel has to follow it down without losing the width
    // the user asked for.
    panelWidth: measured
      ? clampPanelWidth(requestedWidth ?? measured.panelMin, measured)
      : null,
    bounds: measured ? panelBounds(measured) : { min: 0, max: 0 },
    resizePanel,
    resetPanelWidth,
  }
}
