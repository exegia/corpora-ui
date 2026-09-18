"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { useBubbleVariant } from "./context"
import type { TBubbleHeaderProps } from "./types"

/**
 * Author row above a message: avatar, name, time and an optional role badge.
 * The sender variant mirrors the order so the row reads inward from the
 * thread's edge, the same way its bubble does.
 */
export function BubbleHeader({
  className,
  children,
  ...props
}: TBubbleHeaderProps): React.ReactElement {
  const variant = useBubbleVariant()
  const reversed = variant === "sender"

  return (
    <div
      className={cn(
        "gap-2 flex items-center",
        // The message column keeps its inset; only the identity reaches the thread edge.
        reversed && "translate-x-4 flex-row-reverse",
        variant === "recipient" && "-translate-x-4",
        className
      )}
      data-slot="bubble-header"
      {...props}
    >
      {children}
    </div>
  )
}
