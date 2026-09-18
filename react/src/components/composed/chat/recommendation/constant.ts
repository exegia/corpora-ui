import type { TSignalLevel, TTagTone } from "@/components/ui/chat"
import type { TRecommendationState } from "./types"
import { EASE_IN_OUT, EASE_OUT_STRONG } from "@/lib/ease"

export const CONFIDENCE: Record<TSignalLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
}

export const STATE_LABEL: Record<
  Exclude<TRecommendationState, "pending" | "running">,
  string
> = {
  accepted: "Done",
  rejected: "Skipped",
}

/** Status pill tones, shared with the presentation Tag atom. */
export const STATE_TONE: Record<
  Exclude<TRecommendationState, "pending" | "running">,
  TTagTone
> = {
  accepted: "green",
  rejected: "amber",
}

export const ACTION_MOTION = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  initial: { opacity: 0, y: 4 },
  transition: { duration: 0.18, ease: EASE_IN_OUT },
} as const

/** Row entrance, driven by the Group's staggered `visible` variant. */
export const ROW_VARIANTS = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT_STRONG },
  },
} as const

/** Rows enter staggered 80ms apart; each Item picks up `row` from `ROW_VARIANTS`. */
export const GROUP_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const

export const SIZE = 18
export const STROKE = 1.5
export const R = (SIZE - STROKE) / 2
export const C = 2 * Math.PI * R
