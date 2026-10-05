"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { useAtomValue } from "jotai"

import { cn } from "@/lib/utils"
import {
  SCAFFOLD_EASE,
  SCAFFOLD_EDGE_GUTTER,
  SCAFFOLD_MORPH_DURATION,
} from "./constants"
import { scaffoldInspectorOpenAtom } from "./scaffold-atom"
import { useScaffoldContext } from "./scaffold-context"
import type { IScaffoldActionsProps } from "./type"
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
}: IScaffoldActionsProps): React.ReactElement {
  const { scaffoldId, inspectorWidth } = useScaffoldContext()
  const inspectorOpen = useAtomValue(scaffoldInspectorOpenAtom(scaffoldId))
  const actionsRef = React.useRef<HTMLDivElement>(null)
  const [measuredInspectorWidth, setMeasuredInspectorWidth] =
    React.useState<number>()
  React.useLayoutEffect(() => {
    const inspector = actionsRef.current
      ?.closest('[data-slot="scaffold-main"]')
      ?.querySelector<HTMLElement>('[data-slot="scaffold-inspector"]')
    if (!inspector) return
    const measure = () => {
      const width = inspector.getBoundingClientRect().width
      if (width > 0) setMeasuredInspectorWidth(width)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(inspector)
    return () => observer.disconnect()
  }, [])
  const reducedMotion = useReducedMotion()
  const transition = reducedMotion ? { duration: 0 } : SPRING_LAYOUT

  return (
    <motion.div
      id="scaffold-actions"
      ref={actionsRef}
      animate={{
        x: inspectorOpen
          ? -((measuredInspectorWidth ?? inspectorWidth) + SCAFFOLD_EDGE_GUTTER)
          : 0,
      }}
      className={cn(
        "h-12 gap-0.5 sticky inline-flex items-center",
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
        className="gap-1.5 flex items-center"
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
                className="gap-2 py-1.5 pr-3 pl-2 h-full rounded-sm"
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
