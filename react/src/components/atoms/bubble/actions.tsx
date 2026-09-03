"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import type { BubbleActionsProps } from "./types"

/**
 * Row of per-message actions (copy, retry, …). Hidden until the bubble is
 * hovered or an action has focus; compose with `Button size="icon-xs"`.
 */
export function BubbleActions({
  className,
  "aria-label": ariaLabel = "Message actions",
  ...props
}: BubbleActionsProps): React.ReactElement {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/bubble:opacity-100 focus-within:opacity-100 motion-reduce:transition-none relative",
        className
      )}
      data-slot="bubble-actions"
      role="toolbar"
      {...props}
    />
  )
}
