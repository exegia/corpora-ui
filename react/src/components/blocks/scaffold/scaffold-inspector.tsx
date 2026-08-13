"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_EDGE_GUTTER, SCAFFOLD_MORPH_DURATION } from "./constants"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldInspectorProps } from "./type"

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
}: ScaffoldInspectorProps): React.ReactElement {
  const { inspectorOpen, inspectorWidth } = useScaffoldContext()
  const reducedMotion = useReducedMotion()

  // Slide fully past the edge gutter and the drop shadow's blur radius.
  const offcanvasX = inspectorWidth + SCAFFOLD_EDGE_GUTTER + 24

  return (
    <motion.aside
      animate={{ x: inspectorOpen ? 0 : offcanvasX }}
      aria-hidden={inspectorOpen ? undefined : true}
      aria-label={name}
      className={cn(
        "absolute inset-y-2.5 right-2.5 z-20 flex flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]",
        "dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        !inspectorOpen && "pointer-events-none",
        className
      )}
      data-slot="scaffold-inspector"
      inert={inspectorOpen ? undefined : true}
      initial={false}
      role="complementary"
      style={{ width: inspectorWidth }}
      transition={{
        duration: reducedMotion ? 0 : SCAFFOLD_MORPH_DURATION,
        ease: SCAFFOLD_EASE,
      }}
      {...rest}
    >
      {children}
    </motion.aside>
  )
}
