"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_EDGE_GUTTER, SCAFFOLD_MORPH_DURATION } from "./constants"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldActionsProps } from "./type"
import { actionSegmentClass } from "./utils"
import { GroupSeparator } from "@/components/ui/group"
import { GlassButtonGroup } from "@/components/ui/glasscn/glass-button-group"
import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react"

/**
 * The floating pill cluster in the main region's top-right corner — the
 * design's "Panel Context Menu": an Add segment plus an overflow segment
 * whose badge counts the non-visible panels. Slides left in step with the
 * inspector opening.
 */
export function ScaffoldActions({
  onAdd,
  addLabel = "Panel",
  addIcon,
  overflowCount,
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
  const showBrowse = overflowCount !== undefined || onBrowse !== undefined

  return (
    <motion.div
      id="scaffold-actions"
      animate={{
        x: inspectorOpen ? -(inspectorWidth + SCAFFOLD_EDGE_GUTTER) : 0,
      }}
      className={cn(
        "sticky inline-flex items-center gap-0.5 h-12",
        "justify-end",
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
      {children}
      <GlassButtonGroup glassVariant="liquid-refract" className="rounded-md">
        <Button
          aria-label={"add-panel-button"}
          onClick={onAdd}
          size="sm"
          variant="ghost"
        >
          {addIcon ?? <LucidePlus className="stroke-3" />}
          {addLabel}
        </Button>
        {!showBrowse && <GroupSeparator />}
        {showBrowse && (
            <button
              aria-label={browseLabel}
              className={cn(actionSegmentClass, "gap-0.5 px-2")}
              onClick={onBrowse}
              type="button"
              {...soundProps}
            >
              <span className="relative">

                {overflowCount !== undefined && overflowCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-neutral-700 text-[9px] font-semibold text-white dark:bg-neutral-200 dark:text-neutral-900">
                    {overflowCount}
                  </span>
                )}
              </span>

            </button>
        )}

        {children}
      </GlassButtonGroup>
    </motion.div>
  )
}
