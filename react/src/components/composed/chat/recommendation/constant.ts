import type { SignalLevel } from "@/components/ui/chat";
import { motion } from "motion/react";

export const CONFIDENCE: Record<SignalLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
}

export const STATE_LABEL: Record<Exclude<SuggestionState, "pending">, string> = {
  accepted: "Done",
  rejected: "Skipped",
}

export const STATE_COLOR: Record<Exclude<SuggestionState, "pending">, string> = {
  accepted: "bg-green-500",
  rejected: "bg-red-500",
}

// Hoisted: `motion.create` inside render makes a new component type on every
// pass, which remounts the mark and replays its entry animation.
export const STATE_ICON = {
  accepted: motion.create(Check),
  rejected: motion.create(X),
}
