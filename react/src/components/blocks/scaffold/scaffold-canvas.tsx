"use client"

import { AnimatePresence } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import type { ScaffoldCanvasProps } from "./type"

/**
 * The panel row below the action cluster: 8px gutters, 8px gaps, panels
 * side by side. Key each `Scaffold.Panel` child so closes animate out.
 */
export function ScaffoldCanvas({
  className,
  children,
  ...rest
}: ScaffoldCanvasProps): React.ReactElement {
  return (
    <div
      className={cn("relative flex min-h-0 w-full flex-1 gap-2", className)}
      data-slot="scaffold-canvas"
      {...rest}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  )
}
