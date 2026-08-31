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
}

export type BubbleMessageProps = ComponentPropsWithoutRef<"div">

export interface BubbleReaction {
  emoji: ReactNode
  count?: number
  /** Whether the current user has this reaction. */
  reacted?: boolean
  /** Accessible name, e.g. "thumbs up". Required when emoji is not a string. */
  label?: string
}

export interface BubbleReactionsProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onToggle"
> {
  reactions?: BubbleReaction[]
  onToggle?: (reaction: BubbleReaction, index: number) => void
}

export type BubbleActionsProps = ComponentPropsWithoutRef<"div">
