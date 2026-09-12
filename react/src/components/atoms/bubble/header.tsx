"use client"


import type * as React from "react"
import { cn } from "@/lib/utils"
import { useBubbleVariant } from "./context"
import type { BubbleHeaderProps } from "./types"

/**
 * Author row above a message: avatar, name, time and an optional role badge.
 * The sender variant mirrors the order so the row reads inward from the
 * thread's edge, the same way its bubble does.
 */
export function BubbleHeader({
  time,
  className,
  children,
  user,
  ...props
}: BubbleHeaderProps): React.ReactElement {
  const variant = useBubbleVariant()
  const reversed = variant === "sender"


  return (
    <div
      className={cn(
        "flex items-center gap-2",
        reversed && "flex-row-reverse",
        className
      )}
      data-slot="bubble-header"
      {...props}
    >
      {user}
      {children}
      {time !== undefined && time !== null ? (
        <span
          className="text-[10px] leading-none font-semibold text-muted-foreground"
          data-slot="bubble-time"
        >
          {time}
        </span>
      ) : null}
    </div>
  )
}
