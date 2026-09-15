import type { HTMLMotionProps } from "motion/react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

/**
 * Who the bubble belongs to:
 * - "sender"    — the current user's outgoing message (right-aligned, inverted)
 * - "recipient" — an incoming message from another person (left-aligned, muted)
 * - "ai"        — generated output (left-aligned, chrome-less prose)
 */
export type BubbleVariant = "ai" | "sender" | "recipient"

export interface BubbleProps extends ComponentPropsWithoutRef<"div"> {
  variant?: BubbleVariant
  /**
   * A follow-up in a run of messages from the same author: tucks under the
   * previous bubble. Render `Bubble.Header` on the first of the run only.
   */
  continued?: boolean
}

export type BubbleMessageProps = ComponentPropsWithoutRef<"div">

export type BubbleHeaderProps = ComponentPropsWithoutRef<"div">

export interface BubbleReaction {
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
export interface BubblePickedEmoji {
  emoji: string
  label: string
}

export interface BubbleReactionsProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onToggle"
> {
  reactions?: BubbleReaction[]
  onToggle?: (reaction: BubbleReaction, index: number) => void
  /** Fires when an emoji is picked from the add-reaction popover. */
  onEmojiSelect?: (emoji: BubblePickedEmoji) => void
}

export type BubbleActionsProps = ComponentPropsWithoutRef<"div">

export interface BubbleReactionChipProps extends Omit<
  HTMLMotionProps<"button">,
  "onToggle" | "children"
> {
  reaction: BubbleReaction
  index: number
  onToggle?: (reaction: BubbleReaction, index: number) => void
}

export type BubbleReactionsButtonProps = Omit<
  HTMLMotionProps<"button">,
  "onToggle" | "children" | "onClick"
> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Fires when an emoji is picked from the popover. */
  onEmojiSelect?: (emoji: BubblePickedEmoji) => void
}

/**
 * Only what the chip actually forwards. It renders through `Button`, which is
 * either a `<button>` or — with an href — an `<a>`, so the full anchor prop
 * set cannot be honoured (and `type` means two different things across the
 * two elements). Declaring the anchor set wholesale only advertised props the
 * chip silently dropped.
 */