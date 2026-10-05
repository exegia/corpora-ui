import type { HTMLMotionProps } from "motion/react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

/**
 * Who the bubble belongs to:
 * - "sender"    — the current user's outgoing message (right-aligned, inverted)
 * - "recipient" — an incoming message from another person (left-aligned, muted)
 * - "ai"        — generated output (left-aligned, chrome-less prose)
 */
export type TBubbleVariant = "ai" | "sender" | "recipient"

export interface IBubbleProps extends ComponentPropsWithoutRef<"div"> {
  variant?: TBubbleVariant
  /**
   * A follow-up in a run of messages from the same author: tucks under the
   * previous bubble. Render `Bubble.Header` on the first of the run only.
   */
  continued?: boolean
}

export type TBubbleMessageProps = ComponentPropsWithoutRef<"div"> & {
  /** No bubble surface. Automatically true for attachment-only children; set explicitly for custom wrappers. */
  unstyled?: boolean
}

export type TBubbleHeaderProps = ComponentPropsWithoutRef<"div">

export interface IBubbleReaction {
  /** Stable key; falls back to the label/emoji when omitted. */
  id?: string
  emoji: ReactNode | string
  count?: number
  /** Whether the current user has this reaction. */
  reacted?: boolean
  /** Accessible name, e.g. "thumbs up". Required when emoji is not a string. */
  label?: string
}

/** An emoji chosen from the picker. Mirrors frimousse's payload so the
 *  library never re-exports a dependency's type on its public surface. */
export interface IBubblePickedEmoji {
  emoji: string
  label: string
}

export interface IBubbleReactionsProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onToggle"
> {
  reactions?: IBubbleReaction[]
  onToggle?: (reaction: IBubbleReaction, index: number) => void
  /** Fires when an emoji is picked from the add-reaction popover. */
  onEmojiSelect?: (emoji: IBubblePickedEmoji) => void
}

export type TBubbleActionsProps = ComponentPropsWithoutRef<"div">

export interface IBubbleReactionChipProps extends Omit<
  HTMLMotionProps<"button">,
  "onToggle" | "children"
> {
  reaction: IBubbleReaction
  index: number
  onToggle?: (reaction: IBubbleReaction, index: number) => void
}

export type TBubbleReactionsButtonProps = Omit<
  HTMLMotionProps<"button">,
  "onToggle" | "children" | "onClick"
> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Fires when an emoji is picked from the popover. */
  onEmojiSelect?: (emoji: IBubblePickedEmoji) => void
}

/**
 * Only what the chip actually forwards. It renders through `Button`, which is
 * either a `<button>` or — with an href — an `<a>`, so the full anchor prop
 * set cannot be honoured (and `type` means two different things across the
 * two elements). Declaring the anchor set wholesale only advertised props the
 * chip silently dropped.
 */
