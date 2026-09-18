import type { TSignalLevel, TTagTone } from "@/components/ui/chat"
import type { TRecommendationState } from "./types"

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
