"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { useBubbleVariant } from "./context"
import type { TBubbleMessageProps } from "./types"
import { twBubbleMessageClasses } from "./utils"

export function BubbleMessage({
  className,
  ...props
}: TBubbleMessageProps): React.ReactElement {
  const variant = useBubbleVariant()
  return (
    <div
      className={cn(
        "relative select-none flex-col gap-y-2",
        twBubbleMessageClasses[variant],
        className
      )}
      data-slot="bubble-message"
      {...props}
    />
  )
}
