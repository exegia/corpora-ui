"use client"

import { AnimatePresence } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import type { ScaffoldCanvasProps } from "./type"

/**
 * The panel row below the actions cluster: 8px gutters, 8px gaps, panels
 * side by side. Key each `Scaffold.Panel` child so closes animate out.
 */
export function ScaffoldCanvas({
  className,
  children,
  ...rest
}: ScaffoldCanvasProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex h-full w-full gap-2 overflow-x-auto p-2 pt-[52px]",
        className
      )}
      data-slot="scaffold-canvas"
      {...rest}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  )
}
