"use client"

import { motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import { EASE_OUT_STRONG } from "@/lib/ease"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { IApplyToastProps } from "./type"

export function ApplyToast({
  open = true,
  message = "Change applied and recorded in version history.",
  onUndo,
  className,
}: IApplyToastProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion()
  if (!open) return null
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      aria-live="assertive"
      className={cn(
        "flex w-full items-center gap-3 rounded-sm border border-success/32 bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg",
        className
      )}
      data-slot="apply-toast"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      role="status"
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.35, ease: EASE_OUT_STRONG }
      }
    >
      <span className="text-success">✓</span>
      <span className="flex-1">{message}</span>
      {onUndo ? (
        <Button
          className="text-success underline underline-offset-2 ring-offset-0 hover:text-success"
          onClick={onUndo}
          size="xs"
          variant="link"
        >
          Undo
        </Button>
      ) : null}
    </motion.div>
  )
}
