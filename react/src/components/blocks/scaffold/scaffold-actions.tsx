"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_EDGE_GUTTER, SCAFFOLD_MORPH_DURATION } from "./constants"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldActionsProps } from "./type"
import { segmentVariants } from "./utils"
import { Button } from "@/components/ui/button"
import { SPRING_LAYOUT } from "@/lib/ease.ts"
import { LucidePlus } from "lucide-react"

/**
 * The floating pill cluster in the main region's top-right corner — the
 * design's "Panel Context Menu": one tab per open panel (`Scaffold.Tab`
 * children) plus an Add segment. Add renders only while `onAdd` is
 * present — omit it once the canvas holds `SCAFFOLD_PANEL_CAPACITY`
 * panels. Slides left in step with the inspector opening.
 */
export function ScaffoldActions({
  onAdd,
  addLabel = "Panel",
  addIcon,
  sound = true,
  className,
  children,
  ...rest
}: ScaffoldActionsProps): React.ReactElement {
  const { inspectorOpen, inspectorWidth } = useScaffoldContext()
  const reducedMotion = useReducedMotion()
  const transition = reducedMotion ? { duration: 0 } : SPRING_LAYOUT

  return (
    <motion.div
      id="scaffold-actions"
      animate={{
        x: inspectorOpen ? -(inspectorWidth + SCAFFOLD_EDGE_GUTTER) : 0,
      }}
      className={cn(
        "sticky inline-flex h-12 items-center gap-0.5",
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
      <motion.div
        layout
        transition={transition}
        className="flex items-center gap-1.5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {onAdd && (
            <motion.div
              key="scaffold-add"
              layout
              animate={reducedMotion ? { opacity: 1 } : "visible"}
              className="flex shrink-0"
              exit={reducedMotion ? { opacity: 0 } : "exit"}
              initial={reducedMotion ? { opacity: 0 } : "hidden"}
              transition={transition}
              variants={segmentVariants}
            >
              <Button
                onClick={onAdd}
                size="sm"
                sound={sound}
                variant="ghost"
                className="h-full gap-2 rounded-sm py-1.5 pr-3 pl-2"
              >
                {addIcon ?? <LucidePlus className="stroke-2" />}
                {addLabel}
              </Button>
            </motion.div>
          )}
          {children}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
