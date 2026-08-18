/**
 * The shell's layout arithmetic, as plain functions over px.
 *
 * Nothing here touches React or the DOM. This module IS the contract of who
 * gets which column, which keeps the rule unit-testable on its own and lets
 * the planned Jotai port lift it into a derived atom (`shellFitFitsAtom`)
 * without restating it: `usePanelFit` only supplies the measurements.
 */

/** The px the shell lays itself out with. Every field is measured from a CSS
 * variable (see `SHELL_WIDTHS`), never hard-coded, so a consumer's override
 * flows straight through the rule. */
export interface ShellMetrics {
  /** What the left rail occupies right now — its expanded width, its icon
   * width, or 0 when there is no rail at all (or it is off canvas). */
  rail: number
  /** The floor the body refuses to go below. */
  insetMin: number
  /** The secondary panel's floor, which is also the width it opens at. */
  panelMin: number
  /** The viewport all three columns share. */
  viewport: number
  /** px the shell's own frame eats before any column gets a share: its
   * padding, plus the gap between columns.
   *
   * Deliberately absent from `fitsPanel` — that rule is stated against the raw
   * viewport — but subtracted from the resize ceiling, where ignoring it lets
   * a full-width drag push the row past the shell by exactly this much. */
  chrome: number
}

/** px the shell needs before a secondary panel can exist: the rail as it
 * stands, plus the body and the panel at their own floors. */
export function requiredWidth({ rail, insetMin, panelMin }: ShellMetrics) {
  return rail + insetMin + panelMin
}

/**
 * Whether the shell can hold a secondary panel at all. Strictly `<`: a shell
 * that fits its columns exactly has no room left to give one.
 *
 * An unmeasurable shell fails open. A server render, a `display: none` host
 * or a test environment with no layout engine all report 0, and a panel must
 * never disappear over a reading the layout could not produce.
 */
export function fitsPanel(metrics: ShellMetrics) {
  if (metrics.viewport <= 0 || metrics.panelMin <= 0) return true
  return requiredWidth(metrics) < metrics.viewport
}

/** How wide the secondary panel may be: never under its own floor, never past
 * the slack the body holds above its floor. `max` never drops below `min`, so
 * a shell that does not fit reports a degenerate range instead of an inverted
 * one — `fitsPanel` is what hides the panel, not a negative bound. */
export function panelBounds(metrics: ShellMetrics) {
  const { chrome, insetMin, panelMin, rail, viewport } = metrics
  return {
    min: panelMin,
    max: Math.max(panelMin, viewport - chrome - rail - insetMin),
  }
}

export function clampPanelWidth(width: number, metrics: ShellMetrics) {
  const { min, max } = panelBounds(metrics)
  return Math.min(Math.max(width, min), max)
}

/** Resizes fire per pointer move and per resize event, most of them landing
 * on the same numbers — comparing fields keeps those from re-rendering the
 * whole shell. */
export function metricsEqual(a: ShellMetrics, b: ShellMetrics) {
  return (
    a.rail === b.rail &&
    a.insetMin === b.insetMin &&
    a.panelMin === b.panelMin &&
    a.viewport === b.viewport &&
    a.chrome === b.chrome
  )
}
