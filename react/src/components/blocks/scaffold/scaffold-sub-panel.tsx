import * as React from "react"
import { useMotionPanel } from "@/lib/use-motion-panel"
import { useScaffoldContext } from "./scaffold-context"
import { useAtomValue, useSetAtom } from "jotai"
import {
  scaffoldPanelLayoutsAtom,
  updateScaffoldPanelLayoutAtom,
} from "./scaffold-atom"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import type { IScaffoldSubPanelProps } from "./type"
import { subPanelVariant } from "@/components/blocks/scaffold/utils.ts"
import { SCAFFOLD_EASE, SCAFFOLD_MORPH_DURATION } from "./constants"

export function ScaffoldSubPanel({
  panelId = "",
  swapped = false,
  className,
  children,
  variant = "card",
  primary = false,
  expanded,
  ...rest
}: IScaffoldSubPanelProps & {
  panelId?: string
  swapped?: boolean
}): React.ReactElement {
  const reduce = useReducedMotion()
  // The primary card holds the flexible slot unless the panel says otherwise.
  const isExpanded = expanded ?? primary

  const { scaffoldId } = useScaffoldContext()
  const layouts = useAtomValue(scaffoldPanelLayoutsAtom(scaffoldId))
  const updateLayout = useSetAtom(updateScaffoldPanelLayoutAtom(scaffoldId))
  const [height, setHeight] = React.useState(400)
  const { panelRef, gripRef } = useMotionPanel({
    orientation: "vertical",
    enabled: !primary,
    size: isExpanded
      ? Math.min(
          layouts[panelId]?.secondarySize ?? height - 64,
          Math.max(56, height - 64)
        )
      : 56,
    minSize: 56,
    maxSize: Math.max(56, height - 64),
    defaultSize: 56,
    overshoot: false,
    transition: reduce
      ? { duration: 0 }
      : { duration: SCAFFOLD_MORPH_DURATION, ease: SCAFFOLD_EASE },
    onSizeChange: (size) =>
      updateLayout(panelId, {
        secondarySize: Number(size),
        secondaryExpanded: Number(size) > 56,
      }),
  })

  React.useLayoutEffect(() => {
    const parent = panelRef.current?.parentElement
    if (!parent) return
    const measure = () => setHeight(parent.clientHeight || 400)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [panelRef])

  return (
    <motion.div
      layout="position"
      ref={(node) => {
        panelRef.current = node
      }}
      data-motion-panels-fill={primary ? "" : undefined}
      id={`scaffold-sub-panel-${variant}`}
      // Motion Panels animates the boundary; the primary consumes the rest.
      initial={false}
      style={{
        flex: primary ? "1 1 0%" : "0 0 auto",
        minHeight: primary ? 56 : 0,
      }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: SCAFFOLD_MORPH_DURATION, ease: SCAFFOLD_EASE }
      }
      className={cn(
        "relative flex w-full flex-col",
        subPanelVariant[variant],
        // basis-14 + clip let the primary squeeze down to the strip height;
        // the strip keeps its natural (basis-auto) height when collapsed.
        primary ? "overflow-clip" : "",
        className
      )}
      data-slot={`scaffold-sub-panel-${variant}`}
      data-expanded={isExpanded ? "" : undefined}
      {...rest}
    >
      {!primary && (
        <div
          ref={gripRef}
          role="separator"
          aria-label="Resize secondary panel"
          aria-orientation="horizontal"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              updateLayout(panelId, { secondaryExpanded: !isExpanded })
            }
          }}
          className={cn(
            "inset-x-0 h-2 absolute z-10 cursor-row-resize touch-none focus-visible:outline-2 focus-visible:outline-ring",
            swapped ? "-bottom-1" : "-top-1"
          )}
        />
      )}
      {children}
    </motion.div>
  )
}
