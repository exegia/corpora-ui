import type { SignalLevel, TagTone } from "@/components/ui/chat"
import type { RecommendationState } from "./types"

export const CONFIDENCE: Record<SignalLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
}

export const STATE_LABEL: Record<
  Exclude<RecommendationState, "pending" | "running">,
  string
> = {
  accepted: "Done",
  rejected: "Skipped",
}

/** Status pill tones, shared with the presentation Tag atom. */
export const STATE_TONE: Record<
  Exclude<RecommendationState, "pending" | "running">,
  TagTone
> = {
  accepted: "green",
  rejected: "amber",
}
