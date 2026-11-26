"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import type { TBubbleActionsProps } from "./type"

/**
 * Row of per-message actions (copy, retry, …). Hidden until the bubble is
 * hovered or an action has focus; compose with `Button size="icon-xs"`.
 */
export function BubbleActions({
  className,
  "aria-label": ariaLabel = "Message actions",
  ...props
}: TBubbleActionsProps): React.ReactElement {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "gap-0.5 relative flex items-center opacity-0 transition-opacity duration-150 group-hover/bubble:opacity-100 focus-within:opacity-100 motion-reduce:transition-none",
        className
      )}
      data-slot="bubble-actions"
      role="toolbar"
      {...props}
    />
  )
}
