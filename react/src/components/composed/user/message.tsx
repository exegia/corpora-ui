"use client"

import { Bubble } from "@/components/atoms"
import { Info } from "./info"
import type { IUserMessageProps } from "./types"

export function Message({
  children,
  user,
  size,
  continued = false,
  className,
  reactions,
  actions,
}: IUserMessageProps) {
  const direction = user?.direction ?? "sender"
  return (
    <Bubble variant={direction} continued={continued} className={className}>
      {user && !continued && (
        <Bubble.Header>
          <Info
            direction={direction}
            user={user}
            description={user.description}
            audio={user.audio}
            size={size ?? user.size}
            variant="info"
          />
        </Bubble.Header>
      )}
      <Bubble.Message>{children}</Bubble.Message>
      {reactions && <Bubble.Reactions {...reactions} />}
      {actions}
    </Bubble>
  )
}
