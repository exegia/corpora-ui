"use client"

import { RiAddBoxLine, RiArrowDownSLine, RiCheckboxMultipleBlankLine } from "@remixicon/react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_EDGE_GUTTER, SCAFFOLD_MORPH_DURATION } from "./constants"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldActionsProps } from "./type"
import { actionSegmentClass } from "./utils"

/**
 * The floating pill cluster in the main region's top-right corner — the
 * design's "Panel Context Menu": an Add segment plus a browse segment for
 * the open panels. Slides left in step with the inspector opening.
 */
export function ScaffoldActions({
  onAdd,
  addLabel = "Add",
  addIcon,
  count,
  onBrowse,
  browseLabel = "Browse panels",
  sound = true,
  className,
  children,
  ...rest
}: ScaffoldActionsProps): React.ReactElement {
  const { inspectorOpen, inspectorWidth } = useScaffoldContext()
  const reducedMotion = useReducedMotion()

  const soundProps = {
    "data-cuelume-press": sound ? "" : undefined,
    "data-cuelume-release": sound ? "" : undefined,
  }
  const showBrowse = count !== undefined || onBrowse !== undefined

  return (
    <motion.div
      animate={{
        x: inspectorOpen ? -(inspectorWidth + SCAFFOLD_EDGE_GUTTER) : 0,
      }}
      className={cn(
        "absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full bg-neutral-200 p-1.5 shadow-[-3px_9px_10px_rgba(139,139,139,0.16)] dark:bg-neutral-800 dark:shadow-[-3px_9px_10px_rgba(0,0,0,0.35)]",
        className
      )}
      data-slot="scaffold-actions"
      initial={false}
      transition={{
        duration: reducedMotion ? 0 : SCAFFOLD_MORPH_DURATION,
        ease: SCAFFOLD_EASE,
      }}
      {...rest}
    >
      <button
        className={cn(actionSegmentClass, "gap-1.5 px-2.5 text-sm font-medium")}
        onClick={onAdd}
        type="button"
        {...soundProps}
      >
        {addIcon ?? <RiAddBoxLine aria-hidden className="size-4" />}
        {addLabel}
      </button>

      {showBrowse && (
        <>
          <span
            aria-hidden
            className="mx-0.5 w-px self-stretch bg-neutral-300 dark:bg-neutral-700"
          />
          <button
            aria-label={browseLabel}
            className={cn(actionSegmentClass, "gap-0.5 px-2")}
            onClick={onBrowse}
            type="button"
            {...soundProps}
          >
            <span className="relative">
              <RiCheckboxMultipleBlankLine aria-hidden className="size-4" />
              {count !== undefined && count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-neutral-700 text-[9px] font-semibold text-white dark:bg-neutral-200 dark:text-neutral-900">
                  {count}
                </span>
              )}
            </span>
            <RiArrowDownSLine aria-hidden className="size-3.5 opacity-60" />
          </button>
        </>
      )}

      {children}
    </motion.div>
  )
}
