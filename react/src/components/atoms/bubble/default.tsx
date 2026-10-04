"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { BubbleContext } from "./context"
import type { IBubbleProps } from "./type"
import { twBubbleAlignClasses, twBubbleColumnClasses } from "./utils"

export function Bubble({
  variant = "sender",
  continued = false,
  className,
  children,
  ...props
}: IBubbleProps): React.ReactElement {
  return (
    <BubbleContext.Provider value={variant}>
      <div
        className={cn(
          // Full width, not `w-fit`: a fit-content root anchors left, so a
          // short sender message would sit mid-thread with its column
          // right-aligned inside its own box instead of hugging the edge.
          "group/bubble my-3 gap-y-3 relative flex w-full flex-col",
          // 12px bottom margin above minus 10px: a 2px seam between run bubbles.
          continued && "-mt-2.5",
          twBubbleAlignClasses[variant],
          className
        )}
        data-continued={continued ? "" : undefined}
        data-slot="bubble"
        data-variant={variant}
        {...props}
      >
        <div
          className={cn(
            "gap-y-2 relative flex flex-col select-none",
            twBubbleColumnClasses[variant]
          )}
          data-slot="bubble-column"
        >
          {children}
        </div>
      </div>
    </BubbleContext.Provider>
  )
}
