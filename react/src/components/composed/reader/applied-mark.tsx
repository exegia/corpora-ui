"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import type { IAppliedMarkProps } from "./type"

export function AppliedMark({
  nodeId,
  className,
  children,
  ...props
}: IAppliedMarkProps): React.ReactElement {
  return (
    <span
      className={cn(
        "relative border-b-2 border-amber-400/70 text-inherit",
        className
      )}
      data-applied-mark="true"
      data-node-id={nodeId}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute -start-4 top-1/2 text-xs text-amber-600 dark:text-amber-300/90"
      >
        ◆
      </span>
      {children}
    </span>
  )
}
