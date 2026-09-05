import type { BubblePickedEmoji } from "./types"
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
  sender: "items-end",
  recipient: "items-start",
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
  default: "w-fit max-w-fit rounded-[20px] px-5 py-3.5 text-sm leading-[18px] font-normal",
  sender:
    "inset-shadow-lit/90 inset-shadow-dim inset-shadow-dim-b-1.5 inset-shadow-dim-r-1.5 inset-shadow-lit-t-2 inset-shadow-lit-l-1.5 inset-shadow-blur-3 rounded-br-[5px] bg-indigo-600 dark:bg-neutral-100 text-background chat-bubble bubble-sender mr-4 text-left",
  recipient:
    "inset-shadow-lit inset-shadow-dim/20 dark:inset-shadow-lit/30 dark:inset-shadow-dim/90 inset-shadow-dim-b-1 inset-shadow-dim-r-1 inset-shadow-lit-t-2 inset-shadow-lit-l-1 inset-shadow-blur-3 rounded-bl-[5px] bg-neutral-100 dark:bg-neutral-800 text-foreground chat-bubble bubble-recipient ml-4 text-right",
  ai: "text-sm leading-5 text-foreground/90",
}

/**
 * The quick row. frimousse has no way to render a subset — `EmojiPicker.Root`
 * takes `columns`/`skinTone`/`locale`/`emojiVersion`/`emojibaseUrl`/`sticky`
 * and nothing else, and its list is virtualized on fixed-height rows, so a
 * custom `Emoji` component that returns null leaves holes rather than a short
 * row. A fixed list is the only way to show just these, and it costs no
 * network request — the CDN fetch only happens if "More" is opened.
 */
export const QUICK_REACTIONS: readonly BubblePickedEmoji[] = [
  { emoji: "❤️", label: "heart" },
  { emoji: "👍", label: "thumbs up" },
  { emoji: "😊", label: "smiling face" },
  { emoji: "😂", label: "face with tears of joy" },
  { emoji: "🎉", label: "party popper" },
  { emoji: "🙏", label: "folded hands" },
]
