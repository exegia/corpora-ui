"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import type { ISelectionHighlightProps } from "./type"

export function SelectionHighlight({
  range,
  className,
  children,
  ...props
}: ISelectionHighlightProps): React.ReactElement {
  return (
    <span
      aria-label={range ? `Selected ${range}` : "Selected text"}
      className={cn(
        "rounded-xs bg-accent/25 outline-1 outline-accent/45",
        className
      )}
      data-selection-highlight="true"
      {...props}
    >
      {children}
    </span>
  )
}
