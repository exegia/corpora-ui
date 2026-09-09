"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { BubbleContext } from "./context"
import type { BubbleProps } from "./types"
import { twBubbleAlignClasses, twBubbleColumnClasses } from "./utils"

export function Bubble({
  variant = "recipient",
  continued = false,
  className,
  children,
  ...props
}: BubbleProps): React.ReactElement {
  return (
    <BubbleContext.Provider value={variant}>
      <div
        className={cn(
          // Full width, not `w-fit`: a fit-content root anchors left, so a
          // short sender message would sit mid-thread with its column
          // right-aligned inside its own box instead of hugging the edge.
          "group/bubble relative my-3 flex w-full flex-col gap-y-3",
          continued && "-mt-2",
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
            "relative flex flex-col gap-y-2 select-none",
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
