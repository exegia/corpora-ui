"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SelectionHighlightProps extends React.ComponentPropsWithoutRef<"span"> {
  range?: string
}

export function SelectionHighlight({
  range,
  className,
  children,
  ...props
}: SelectionHighlightProps): React.ReactElement {
  return (
    <span
      aria-label={range ? `Selected ${range}` : "Selected text"}
      className={cn(
        "rounded-sm bg-[#f3ba20]/25 outline outline-1 outline-[#f3ba20]/45",
        className
      )}
      data-selection-highlight="true"
      {...props}
    >
      {children}
    </span>
  )
}

export interface AppliedMarkProps extends React.ComponentPropsWithoutRef<"span"> {
  nodeId?: string
}

export function AppliedMark({
  nodeId,
  className,
  children,
  ...props
}: AppliedMarkProps): React.ReactElement {
  return (
    <span
      className={cn(
        "relative border-b-2 border-[#f3ba20] text-inherit",
        className
      )}
      data-applied-mark="true"
      data-node-id={nodeId}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute -start-4 top-1/2 text-xs text-[#f3ba20]"
      >
        ◆
      </span>
      {children}
    </span>
  )
}

export interface ApplyToastProps {
  open?: boolean
  message?: React.ReactNode
  onUndo?: () => void
  className?: string
}

export function ApplyToast({
  open = true,
  message = "Change applied and recorded in version history.",
  onUndo,
  className,
}: ApplyToastProps): React.ReactElement | null {
  if (!open) return null
  return (
    <div
      aria-live="assertive"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-emerald-400/30 bg-[#171716] px-3 py-2.5 text-xs text-white shadow-lg",
        className
      )}
      data-slot="apply-toast"
      role="status"
    >
      <span className="text-emerald-300">✓</span>
      <span className="flex-1">{message}</span>
      {onUndo ? (
        <Button
          className="text-emerald-200 underline underline-offset-2 ring-offset-0 hover:text-emerald-200 focus-visible:ring-emerald-200/60"
          onClick={onUndo}
          size="xs"
          variant="link"
        >
          Undo
        </Button>
      ) : null}
    </div>
  )
}
