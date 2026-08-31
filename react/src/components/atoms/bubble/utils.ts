import type { ClassValue } from "clsx"
import type { BubbleVariant } from "./types"

/** Root alignment: outgoing hugs the right edge, everything else the left. */
export const twBubbleAlignClasses: Record<BubbleVariant, ClassValue> = {
  sender: "items-end",
  recipient: "items-start",
  ai: "items-start",
}

/**
 * Message surface per variant. "sender" mirrors the UserMessage bubble,
 * "recipient" is its muted counterpart, "ai" renders as plain prose so
 * generated output never masquerades as a person's message.
 */
export const twBubbleMessageClasses: Record<BubbleVariant, ClassValue> = {
  sender:
    "max-w-[88%] rounded-xl rounded-br-sm bg-foreground px-3 py-1.5 text-xs text-background shadow-bezel",
  recipient:
    "max-w-[88%] rounded-xl rounded-bl-sm bg-muted px-3 py-1.5 text-xs text-foreground",
  ai: "w-full text-[13px] leading-6 text-foreground/90",
}
