"use client"

import type * as React from "react"
import { Bubble } from "@/components/atoms"

export interface UserMessageProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  children: React.ReactNode
}

export function UserMessage({
  children,
  ...props
}: UserMessageProps): React.ReactElement {
  return (
    <Bubble variant="sender" {...props}>
      <Bubble.Message>{children}</Bubble.Message>
    </Bubble>
  )
}
