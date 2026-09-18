"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Block examples keep controls in normal flow so they never cover the preview. */
export function BlockDemoStage({
  controls,
  children,
  canvasClassName,
}: {
  controls?: ReactNode
  children: ReactNode
  canvasClassName?: string
}) {
  return (
    <div className="not-prose min-w-0 flex w-full flex-col overflow-hidden rounded-xl border bg-background">
      <div className="min-w-0 p-4 sm:p-6">
        <div
          className={cn(
            "min-h-32 min-w-0 flex w-full items-center justify-center",
            canvasClassName
          )}
        >
          {children}
        </div>
      </div>
      {controls ? (
        <div className="p-4 sm:p-6 border-t bg-muted/30">
          <p className="mb-4 text-sm font-medium">Example controls</p>
          <div className="gap-x-8 gap-y-4 sm:grid-cols-2 grid grid-cols-1 items-center">
            {controls}
          </div>
        </div>
      ) : null}
    </div>
  )
}
