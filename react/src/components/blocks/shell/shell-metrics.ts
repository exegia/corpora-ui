/**
 * The shell's layout arithmetic, as plain functions over px.
 *
 * Nothing here touches React or the DOM. This module IS the contract of who
 * gets which column, which keeps the rule unit-testable on its own and lets
 * the shell-fit atoms (`shellFitFitsAtom`, `shellFitPanelWidthAtom`) call it
 * without restating it: `useShellFit` only supplies the measurements.
 */

/** The px the shell lays itself out with. Every field is measured from a CSS
 * variable (see `SHELL_WIDTHS`), never hard-coded, so a consumer's override
 * flows straight through the rule. */
export interface IShellSidebarFit {
  width: number
  minWidth: number
  maxWidth: number
  canExpand: boolean
  mode: "expanded" | "icon" | "hidden"
}

/** Reserve the body first, then shrink, fold, or hide the navigation rail.
 * The requested width/open state is retained so widening restores it. */
export function fitSidebar({
  width,
  padding,
  gap,
  insetMin,
  expanded,
  icon,
  minimum,
  open,
  collapsible,
  present,
}: {
  width: number
  padding: number
  gap: number
  insetMin: number
  expanded: number
  icon: number
  minimum: number
  open: boolean
  collapsible: string
  present: boolean
}): IShellSidebarFit {
  const room = width > 0 ? Math.max(0, width - padding - gap - insetMin) : 480
  const canExpand = present && room >= minimum
  const isExpanded = canExpand && (open || collapsible === "none")
  const railWidth = !present
    ? 0
    : isExpanded
      ? Math.min(expanded, room)
      : collapsible === "offcanvas" || room < icon
        ? 0
        : icon
  return {
    width: railWidth,
    minWidth: minimum,
    maxWidth: Math.max(minimum, Math.min(480, room)),
    canExpand,
    mode: railWidth === 0 ? "hidden" : isExpanded ? "expanded" : "icon",
  }
}

export interface IShellMetrics {
  sidebar?: IShellSidebarFit
  /** What the left rail occupies right now — its expanded width, its icon
   * width, or 0 when there is no rail at all (or it is off canvas). */
  rail: number
  /** The floor the body refuses to go below. */
  insetMin: number
  /** The secondary panel's floor, which is also the width it opens at. */
  panelMin: number
  /** Available shell container width (legacy field name). */
  viewport: number
  /** px the shell's own frame eats before any column gets a share: its
   * padding, plus the gap between columns.
   */
  chrome: number
}

/** px the shell needs before a secondary panel can exist: the rail as it
 * stands, plus the body and the panel at their own floors. */
export function requiredWidth({ rail, insetMin, panelMin }: IShellMetrics) {
  return rail + insetMin + panelMin
}

/**
 * Whether the shell can hold a secondary panel, including padding and gaps.
 *
 * An unmeasurable shell fails open. A server render, a `display: none` host
 * or a test environment with no layout engine all report 0, and a panel must
 * never disappear over a reading the layout could not produce.
 */
export function fitsPanel(metrics: IShellMetrics) {
  if (metrics.viewport <= 0 || metrics.panelMin <= 0) return true
  return requiredWidth(metrics) + metrics.chrome <= metrics.viewport
}

/** How wide the secondary panel may be: never under its own floor, never past
 * the slack the body holds above its floor. `max` never drops below `min`, so
 * a shell that does not fit reports a degenerate range instead of an inverted
 * one — `fitsPanel` is what hides the panel, not a negative bound. */
export function panelBounds(metrics: IShellMetrics) {
  const { chrome, insetMin, panelMin, rail, viewport } = metrics
  return {
    min: panelMin,
    max: Math.max(panelMin, viewport - chrome - rail - insetMin),
  }
}

export function clampPanelWidth(width: number, metrics: IShellMetrics) {
  const { min, max } = panelBounds(metrics)
  return Math.min(Math.max(width, min), max)
}

/** Resizes fire per pointer move and per resize event, most of them landing
 * on the same numbers — comparing fields keeps those from re-rendering the
 * whole shell. */
export function metricsEqual(a: IShellMetrics, b: IShellMetrics) {
  return (
    a.rail === b.rail &&
    a.insetMin === b.insetMin &&
    a.panelMin === b.panelMin &&
    a.viewport === b.viewport &&
    a.chrome === b.chrome &&
    a.sidebar?.width === b.sidebar?.width &&
    a.sidebar?.minWidth === b.sidebar?.minWidth &&
    a.sidebar?.maxWidth === b.sidebar?.maxWidth &&
    a.sidebar?.canExpand === b.sidebar?.canExpand &&
    a.sidebar?.mode === b.sidebar?.mode
  )
}
