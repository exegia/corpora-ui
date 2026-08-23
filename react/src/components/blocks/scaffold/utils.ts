import type { Variants } from "motion/react"
import type { ClassNameValue } from "tailwind-merge"
import type {
  ScaffoldPanelVisibility,
  TSubPanelVariant,
} from "@/components/blocks/scaffold/type.ts"
import { EASE_OUT } from "@/lib/ease.ts"
import {
  SCAFFOLD_CANVAS_GAP,
  SCAFFOLD_PANEL_CAPACITY,
  SCAFFOLD_PANEL_MIN_WIDTH,
} from "./constants"

/**
 * How many panels fit on a canvas of `width` px, granting each
 * `SCAFFOLD_PANEL_MIN_WIDTH` plus the gaps between them. Clamped to
 * [1, SCAFFOLD_PANEL_CAPACITY]; an unmeasured canvas (`null`) fits the cap.
 */
export function getPanelCapacity(width: number | null): number {
  if (width === null) return SCAFFOLD_PANEL_CAPACITY
  const fits = Math.floor(
    (width + SCAFFOLD_CANVAS_GAP) /
      (SCAFFOLD_PANEL_MIN_WIDTH + SCAFFOLD_CANVAS_GAP)
  )
  return Math.max(1, Math.min(SCAFFOLD_PANEL_CAPACITY, fits))
}

/** @internal An untracked scaffold: nothing registered, nothing hidden. */
export const EMPTY_SCAFFOLD_VISIBILITY: ScaffoldPanelVisibility = {
  visibleOrder: [],
  autoHidden: [],
  userHidden: [],
}

/**
 * @internal Fold the registered ids and current capacity into a settled
 * visibility: prune departed panels, admit new ones, evict the
 * least-recently-activated visible panels past capacity, and restore
 * auto-hidden ones when room returns. Returns `prev` untouched when nothing
 * changes, so callers can compare identities instead of contents.
 */
export function reconcileVisibility(
  prev: ScaffoldPanelVisibility,
  ids: readonly string[],
  capacity: number
): ScaffoldPanelVisibility {
  const known = new Set(ids)
  const visibleOrder = prev.visibleOrder.filter((id) => known.has(id))
  const autoHidden = prev.autoHidden.filter((id) => known.has(id))
  const userHidden = prev.userHidden.filter((id) => known.has(id))

  const tracked = new Set([...visibleOrder, ...autoHidden, ...userHidden])
  for (const id of ids) if (!tracked.has(id)) visibleOrder.push(id)

  while (visibleOrder.length > capacity && visibleOrder.length > 1) {
    autoHidden.push(visibleOrder.shift() as string)
  }
  while (visibleOrder.length < capacity && autoHidden.length > 0) {
    visibleOrder.push(autoHidden.pop() as string)
  }

  const unchanged =
    visibleOrder.join(" ") === prev.visibleOrder.join(" ") &&
    autoHidden.join(" ") === prev.autoHidden.join(" ") &&
    userHidden.join(" ") === prev.userHidden.join(" ")
  return unchanged ? prev : { visibleOrder, autoHidden, userHidden }
}

/** Desktop backdrop the whole scaffold sits on — a soft warm-gray wash. */
export const scaffoldBackgroundClass: ClassNameValue =
  "bg-linear-to-tr/increasing from-neutral-400 via-stone-200 to-neutral-300 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950"

/** Card surface shared by a panel's primary area and secondary strip. */
export const panelSurfaceClass: ClassNameValue =
  "rounded-2xl bg-slate-100 inset-ring-1 inset-ring-white/60 dark:bg-neutral-900 dark:inset-ring-white/5"

/** Floating icon button hovering over a panel (close, swap). */
export const floatingButtonClass: ClassNameValue =
  "transition-[opacity,scale,box-shadow] duration-200 ease-smooth-out hover:text-neutral-900 hover:shadow-md active:scale-97 dark:bg-neutral-800/95 dark:text-neutral-300 dark:inset-ring-white/10 dark:hover:text-white motion-reduce:transition-none motion-reduce:active:scale-100 z-20"

/** Hidden until the pointer rests on the panel (always shown for touch and
 * while focused) — the affordances stay quiet until the panel is engaged. */
export const revealOnPanelHoverClass: ClassNameValue =
  "opacity-0 scale-95 group-hover/panel:opacity-100 group-hover/panel:scale-100 focus-visible:opacity-100 focus-visible:scale-100 pointer-coarse:opacity-100 pointer-coarse:scale-100"

/** Pill segment inside the actions cluster (Add, browse). */
export const actionSegmentClass: ClassNameValue =
  "flex h-[30px] items-center rounded-full text-neutral-700 transition-[background-color,color,scale,box-shadow] duration-150 ease-smooth-out hover:bg-white hover:text-neutral-900 hover:shadow-xs active:scale-97 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white motion-reduce:transition-none motion-reduce:active:scale-100"

/** Pill segments (seam-menu actions, tabs, Add) blur/fade in place while
 * the track morphs around them. The exit is a fast tween, not the layout
 * spring — the track stays overflow-visible, so popped-out segments must be
 * gone before the shrinking pill leaves them behind as a ghost. */
export const segmentVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.18, ease: EASE_OUT },
  },
}

/** Map of sub-panel variants to their corresponding side. */
export const subPanelVariant: Record<TSubPanelVariant, ClassNameValue> = {
  card: "bg-neutral-50 dark:bg-neutral-900 rounded-md border-t border-b border-t-white dark:border-t-neutral-700/50 border-b-neutral-900/10 dark:border-b-black/70 shadow-sm shadow-neutral-900/10 dark:shadow-black/50 inset-shadow-sm inset-shadow-white dark:inset-shadow-neutral-800",
  subtle: "bg-neutral-100 dark:bg-neutral-800",
  inset: "bg-neutral-200 dark:bg-neutral-700",
} as const
