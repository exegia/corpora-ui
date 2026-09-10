"use client"

import { Check, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import { EASE_OUT_STRONG } from "@/lib/ease"
import { cn } from "@/lib/utils"
import type { RecommendationState } from "./types"

export interface RecommendationCheckboxProps {
  state: RecommendationState
  /** Number shown inside the pending ring (its position in the group). */
  step?: number
  className?: string
}

const SIZE = 18
const STROKE = 1.5
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

/**
 * Outcome mark after beautiful-ui's Task Rows: a spinning ring while pending
 * (with the step number inside), then a filled badge that pops in — green
 * check when accepted, red cross when rejected.
 */
export function Checkbox({
  state,
  step,
  className,
}: RecommendationCheckboxProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: EASE_OUT_STRONG }

  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      data-slot="recommendation-state"
      data-state={state}
      style={{ width: SIZE, height: SIZE }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {state === "pending" ? (
          <motion.span
            key="pending"
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-grid place-items-center [grid-area:1/1]"
            exit={{ scale: 0.4, opacity: 0 }}
            initial={{ scale: 0.4, opacity: 0 }}
            style={{ width: SIZE, height: SIZE }}
            transition={transition}
          >
            <svg
              aria-hidden="true"
              className={cn("absolute inset-0", !reduceMotion && "animate-spin [animation-duration:1.1s]")}
              height={SIZE}
              width={SIZE}
            >
              <circle className="stroke-border-default" cx={SIZE / 2} cy={SIZE / 2} fill="none" r={R} strokeWidth={STROKE} />
              <circle
                className="stroke-text-muted"
                cx={SIZE / 2}
                cy={SIZE / 2}
                fill="none"
                r={R}
                strokeDasharray={`${C * 0.28} ${C * 0.72}`}
                strokeLinecap="round"
                strokeWidth={STROKE}
              />
            </svg>
            {step !== undefined ? (
              <span className="relative text-[9px] font-semibold tabular-nums text-text-primary">{step}</span>
            ) : null}
          </motion.span>
        ) : (
          <motion.span
            key={state}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "inline-grid place-items-center rounded-full text-white [grid-area:1/1]",
              state === "accepted" ? "bg-semantic-success" : "bg-semantic-danger"
            )}
            exit={{ scale: 0.4, opacity: 0 }}
            initial={{ scale: 0, opacity: 0 }}
            style={{ width: SIZE, height: SIZE }}
            transition={transition}
          >
            {state === "accepted" ? (
              <Check aria-hidden="true" className="size-3 stroke-[3.5]" />
            ) : (
              <X aria-hidden="true" className="size-2.5 stroke-[3.5]" />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
