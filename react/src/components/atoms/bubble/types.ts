import type { HTMLMotionProps } from "motion/react";
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

/** Identity shown by `Bubble.Header` when no custom avatar node is passed. */
export interface BubbleAvatarIdentity {
  src?: string
  name?: string
  initials?: string
}

export interface BubbleHeaderProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  /** Display name of the author. */
  name: ReactNode
  /** Relative or absolute time label, e.g. "5 min ago". */
  time?: ReactNode
  /**
   * Role badge. A string renders the standard chip (neutral for people,
   * accent for the ai variant); pass a node for anything custom.
   */
  badge?: ReactNode
  /**
   * Avatar. An identity object renders `UserAvatar`; a node is used as-is.
   * Omitted, the ai variant falls back to the spark mark and people get
   * initials derived from `name` when it is a string.
   */
  avatar?: ReactNode | BubbleAvatarIdentity
  /** Extra trailing content (a menu trigger, a status dot). */
  children?: ReactNode
}

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

export interface BubbleReactionsProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onToggle"
> {
  reactions?: BubbleReaction[]
  onToggle?: (reaction: BubbleReaction, index: number) => void
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