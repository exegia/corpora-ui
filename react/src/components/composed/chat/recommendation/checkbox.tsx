"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import { EASE_OUT_STRONG } from "@/lib/ease"
import { cn } from "@/lib/utils"
import { STATE_ICON } from "./constant"
import type { RecommendationState } from "./types"

export interface RecommendationCheckboxProps {
  state: RecommendationState
  className?: string
}

/**
 * Outcome mark: hollow ring while pending; the filled badge pops in
 * (scale 0 → 1, strong ease-out) when the state resolves.
 */
export function Checkbox({
  state,
  className,
}: RecommendationCheckboxProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: EASE_OUT_STRONG }
  const Icon = state === "pending" ? null : STATE_ICON[state]

  return (
    <span
      className={cn(
        "relative inline-grid size-4 shrink-0 place-items-center",
        className
      )}
      data-slot="recommendation-state"
      data-state={state}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "inline-grid size-3.5 place-items-center rounded-full border-[1.5px] [grid-area:1/1]",
            state === "accepted"
              ? "border-transparent bg-indigo-500/80 text-white"
              : state === "rejected"
                ? "border-transparent bg-foreground/30 text-muted"
                : "border-neutral-700 bg-transparent dark:border-neutral-500"
          )}
          exit={{ scale: 0.4, opacity: 0 }}
          initial={{ scale: 0, opacity: 0 }}
          key={state}
          transition={transition}
        >
          {Icon ? <Icon aria-hidden="true" className="size-3 stroke-[4]" /> : null}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
