"use client"

import type * as React from "react"
import {
  Bubble,
  type BubbleHeaderProps,
  type BubbleReaction,
} from "@/components/atoms/bubble"

export interface UserMessageProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  children: React.ReactNode
  /** Author row above the bubble. Without a name no header renders. */
  author?: React.ReactNode
  time?: React.ReactNode
  badge?: React.ReactNode
  avatar?: BubbleHeaderProps["avatar"]
  /** Emoji reactions hanging off the bubble's corner. */
  reactions?: BubbleReaction[]
  onReactionToggle?: (reaction: BubbleReaction, index: number) => void
}

export function UserMessage({
  children,
  author,
  time,
  badge,
  avatar,
  reactions,
  onReactionToggle,
  ...props
}: UserMessageProps): React.ReactElement {
  return (
    <Bubble variant="sender" {...props}>
      {author !== undefined && author !== null ? (
        <Bubble.Header avatar={avatar} badge={badge} name={author} time={time} />
      ) : null}
      <Bubble.Message>{children}</Bubble.Message>
      {reactions?.length ? (
        <Bubble.Reactions onToggle={onReactionToggle} reactions={reactions} />
      ) : null}
    </Bubble>
  )
}
