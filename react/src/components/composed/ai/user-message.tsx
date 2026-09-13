"use client"

import type * as React from "react"
import { Bubble, type BubbleReaction } from "@/components/atoms/bubble"
import type { UserType } from "@/components/atoms"
import User, { type UserInfoProps } from "@/components/composed/user"

export interface UserMessageProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  children: React.ReactNode
  /** Author row above the bubble. Without a user no header renders. */
  user?: UserType
  time?: React.ReactNode
  /** Replaces the default `User.Info` identity row in the header. */
  UserInfo?: React.FC<UserInfoProps>
  /** Emoji reactions hanging off the bubble's corner. */
  reactions?: BubbleReaction[]
  onReactionToggle?: (reaction: BubbleReaction, index: number) => void
}

export function UserMessage({
  children,
  user,
  time,
  UserInfo = User.Info,
  reactions,
  onReactionToggle,
  ...props
}: UserMessageProps): React.ReactElement {
  return (
    <Bubble variant="sender" {...props}>
      {user ? (
        <Bubble.Header time={time} user={user} UserInfo={UserInfo} />
      ) : null}
      <Bubble.Message>{children}</Bubble.Message>
      {reactions?.length ? (
        <Bubble.Reactions onToggle={onReactionToggle} reactions={reactions} />
      ) : null}
    </Bubble>
  )
}
