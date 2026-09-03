import type { ClassValue } from "clsx"
import type { BubbleReaction, BubbleVariant } from "./types"

/** Returns a stable key for a reaction, falling back to the emoji label if no ID is provided. */
export function reactionKey(reaction: BubbleReaction, index: number): string {
  return reaction.id ?? `${reaction.label ?? String(reaction.emoji)}-${index}`
}

/** Root alignment: outgoing hugs the right edge, everything else the left. */
export const twBubbleAlignClasses: Record<BubbleVariant, ClassValue> = {
  sender: "items-end",
  recipient: "items-start",
  ai: "items-start",
}

/**
 * The inner column shrink-wraps the message so the header, reaction pill
 * and action row all align to the bubble's own edges rather than the
 * thread's. Generated output stays full-bleed.
 */
export const twBubbleColumnClasses: Record<BubbleVariant, ClassValue> = {
  sender: "max-w-[88%] items-end",
  recipient: "max-w-[88%] items-start",
  ai: "w-full items-start",
}

/**
 * Message surface per variant. The two people's bubbles are inverted
 * mirrors — a lit surface (top highlight, shaded base) for the sender and
 * a dim one for the recipient — with the tail corner pinched; the ai
 * variant renders as plain prose so generated output never masquerades as
 * a person's message.
 */
export const twBubbleMessageClasses: Record<BubbleVariant, ClassValue> = {
  sender:
    "bg-neutral-700 dark:bg-neutral-200 text-background chat-bubble bubble-sender",
  recipient:
    "bg-neutral-100 text-foreground shadow-bubble-lit chat-bubble bubble-recipient",
  ai: "text-sm leading-5 text-foreground/90 chat-bubble bubble-ai",
}
