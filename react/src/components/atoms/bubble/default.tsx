"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { BubbleContext } from "./context"
import type { BubbleProps } from "./types"
import { twBubbleAlignClasses, twBubbleColumnClasses } from "./utils"

export function Bubble({
  variant = "recipient",
  className,
  children,
  ...props
}: BubbleProps): React.ReactElement {
  return (
    <BubbleContext.Provider value={variant}>
      <div
        className={cn(
          "group/bubble flex w-fit flex-col relative gap-y-3 my-3",
          twBubbleAlignClasses[variant],
          className
        )}
        data-slot="bubble"
        data-variant={variant}
        {...props}
      >
        <div
          className={cn(
            "flex flex-col gap-y-2  relative",
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
