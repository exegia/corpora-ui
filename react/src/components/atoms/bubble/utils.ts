import type { ClassValue } from "clsx"
import type { BubbleReaction, BubbleVariant } from "./types"

/** Returns a stable key for a reaction, falling back to the emoji label if no ID is provided. */
export function reactionKey(reaction: BubbleReaction, index: number): string {
  return reaction.id ?? `${reaction.label ?? String(reaction.emoji)}-${index}`
}

/** Root alignment: outgoing hugs the right edge, everything else the left. */
export const twBubbleAlignClasses: Record<BubbleVariant, ClassValue> = {
  default: "items-start",
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
  default: "max-w-[80%] min-w-0",
  sender: "items-end max-w-[80%] min-w-0 mr-4",
  recipient: "items-start max-w-[80%] min-w-0 ml-4",
  ai: "w-full items-stretch max-w-[90%] min-w-0",
}

/**
 * Message surface per variant. The two people's bubbles are inverted
 * mirrors — a lit surface (top highlight, shaded base) for the sender and
 * a dim one for the recipient — with the tail corner pinched only on the
 * last bubble of a run (a following `continued` bubble un-pinches it) and
 * both bottom corners squared to `lg` when an attachment sits inside; the ai
 * variant renders as plain prose so generated output never masquerades as
 * a person's message.
 */
export const twBubbleMessageClasses: Record<BubbleVariant, ClassValue> = {
  default:
    "w-fit  rounded-full text-xs leading-4 font-medium relative",
  sender:
    "inset-shadow-lit inset-shadow-dim inset-shadow-dim-b-1 inset-shadow-dim-r inset-shadow-lit-l-1 inset-shadow-lit-t-1 inset-shadow-blur-1 rounded-br-[8px] group-has-[+[data-continued]]/bubble:rounded-br-full has-[[data-slot=attachment]]:rounded-b-lg has-[[data-slot=attachment]]:rounded-t-2xl bg-indigo-700 dark:bg-neutral-100 text-background chat-bubble bubble-sender text-left pl-6 pr-4 py-3",
  recipient:
    "inset-shadow-lit inset-shadow-dim/20 dark:inset-shadow-lit/20 dark:inset-shadow-dim/50 inset-shadow-dim-b-1 inset-shadow-dim-r inset-shadow-lit-t-1 inset-shadow-lit-l-1 inset-shadow-blur-1 rounded-bl-[8px] group-has-[+[data-continued]]/bubble:rounded-bl-full has-[[data-slot=attachment]]:rounded-b-lg has-[[data-slot=attachment]]:rounded-t-2xl bg-neutral-100 dark:bg-neutral-800 text-foreground chat-bubble bubble-recipient text-right pl-4 pr-6 py-3",
  ai: "text-xs leading-4 text-foreground w-full",
}
