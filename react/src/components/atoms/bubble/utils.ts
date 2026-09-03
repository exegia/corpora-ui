import type { ClassValue } from "clsx"
import type { BubbleVariant } from "./types"

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
    "w-fit max-w-full rounded-[20px] rounded-br-[4px] bg-foreground px-5 py-3 text-xs leading-[15px] font-semibold text-background shadow-bubble-dim dark:shadow-bubble-lit",
  recipient:
    "w-fit max-w-full rounded-[20px] rounded-bl-lg bg-neutral-100 px-[18px] py-3 text-xs leading-4 font-semibold text-foreground shadow-bubble-lit dark:bg-neutral-800 dark:shadow-bubble-dim",
  ai: "w-full text-sm leading-5 font-medium text-foreground/90",
}
