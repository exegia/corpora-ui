"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { useBubbleVariant } from "./context"
import type { BubbleMessageProps } from "./types"
import { twBubbleMessageClasses } from "./utils"

export function BubbleMessage({
  className,
  ...props
}: BubbleMessageProps): React.ReactElement {
  const variant = useBubbleVariant()
  return (
    <div
      className={cn("relative select-none", twBubbleMessageClasses[variant], className)}
      data-slot="bubble-message"
      {...props}
    />
  )
}
