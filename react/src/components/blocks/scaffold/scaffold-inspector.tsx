"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { useAtomValue, useSetAtom } from "jotai"

import { useMotionPanel } from "@/lib/use-motion-panel"
import { cn } from "@/lib/utils"
import {
  SCAFFOLD_EASE,
  SCAFFOLD_EDGE_GUTTER,
  SCAFFOLD_MORPH_DURATION,
} from "./constants"
import {
  scaffoldInspectorOpenAtom,
  toggleScaffoldInspectorAtom,
  resizeScaffoldInspectorAtom,
  setScaffoldInspectorOpenAtom,
} from "./scaffold-atom"
import { useScaffoldContext } from "./scaffold-context"
import type { IScaffoldInspectorProps } from "./type"
import { GlassContainer } from "@/components/ui/glasscn/glass-container.tsx"
import { Button } from "@/components/ui/button"
import { LucideX } from "lucide-react"
import { SCAFFOLD_BEZEL_CLASSES } from "./utils"

/**
 * The right-hand drawer: a brighter card that slides in over the canvas,
 * inset from the viewport edges. Open state lives on `Scaffold.Root` (or
 * `useScaffold().providerProps`); the drawer stays mounted so it can slide
 * back out.
 */
export function ScaffoldInspector({
  children,
  name = "Inspector",
  className,
  ...rest
}: IScaffoldInspectorProps): React.ReactElement {
  const { scaffoldId, inspectorWidth } = useScaffoldContext()
  const inspectorOpen = useAtomValue(scaffoldInspectorOpenAtom(scaffoldId))
  const toggleInspector = useSetAtom(toggleScaffoldInspectorAtom(scaffoldId))
  const reducedMotion = useReducedMotion()

  const resizeInspector = useSetAtom(resizeScaffoldInspectorAtom(scaffoldId))
  const setInspectorOpen = useSetAtom(setScaffoldInspectorOpenAtom(scaffoldId))
  const [availableWidth, setAvailableWidth] = React.useState<number>(Infinity)
  const { panelRef, gripRef } = useMotionPanel({
    size: Math.min(inspectorWidth, availableWidth),
    minSize: 180,
    maxSize: "90%",
    defaultSize: 272,
    collapsed: !inspectorOpen,
    overshoot: false,
    onSizeChange: (size) => resizeInspector(Number(size)),
    onCollapsedChange: (collapsed) => setInspectorOpen(!collapsed),
    transition: reducedMotion
      ? { duration: 0 }
      : { duration: SCAFFOLD_MORPH_DURATION, ease: SCAFFOLD_EASE },
  })

  React.useLayoutEffect(() => {
    const parent = panelRef.current?.parentElement
    if (!parent) return
    const measure = () => {
      if (parent.clientWidth) setAvailableWidth(parent.clientWidth * 0.9)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [panelRef])

  // Slide fully past the edge gutter and the drop shadow's blur radius.
  const offcanvasX = inspectorWidth + SCAFFOLD_EDGE_GUTTER + 12

  return (
    <motion.aside
      id="scaffold-inspector"
      ref={panelRef}
      animate={{ x: inspectorOpen ? 0 : offcanvasX }}
      aria-hidden={inspectorOpen ? undefined : true}
      aria-label={name}
      className={cn(
        "right-0 my-2 w-96 absolute z-20 flex h-full max-h-[calc(100%-0.5rem)] flex-col",
        !inspectorOpen && "pointer-events-none",
        className
      )}
      data-slot="scaffold-inspector"
      inert={inspectorOpen ? undefined : true}
      initial={false}
      role="complementary"
      style={{ overflow: inspectorOpen ? undefined : "clip" }}
      transition={{
        duration: reducedMotion ? 0 : SCAFFOLD_MORPH_DURATION,
        ease: SCAFFOLD_EASE,
      }}
      {...rest}
    >
      <div
        ref={gripRef}
        role="separator"
        aria-label="Resize inspector"
        aria-orientation="vertical"
        tabIndex={inspectorOpen ? 0 : -1}
        className="inset-y-0 -left-1 w-2 absolute z-30 cursor-col-resize touch-none focus-visible:outline-2 focus-visible:outline-ring"
      />
      <GlassContainer
        className={cn(
          "bg-neutral-50/20 dark:bg-black/5 flex flex-1 flex-col rounded-md",
          SCAFFOLD_BEZEL_CLASSES
        )}
        glassVariant="subtle"
      >
        <div
          id="scaffold-inspector-header"
          className="h-12 gap-2 pr-3 pl-4 flex items-center justify-between border-b"
        >
          <span className="text-base font-normal text-card-foreground/70">
            {name}
          </span>
          <Button
            size="icon-xs"
            variant="glass"
            glassVariant="subtle"
            className="scale-85"
            aria-label="Close inspector"
            onClick={toggleInspector}
          >
            <LucideX className="stroke-3" />
          </Button>
        </div>
        {children}
      </GlassContainer>
    </motion.aside>
  )
}
