"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_EDGE_GUTTER, SCAFFOLD_MORPH_DURATION } from "./constants"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldInspectorProps } from "./type"
import { GlassContainer } from "@/components/ui/glasscn/glass-container.tsx"

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
  const offcanvasX = inspectorWidth + SCAFFOLD_EDGE_GUTTER + 12

  return (
    <motion.aside
      id="scaffold-inspector"
      animate={{ x: inspectorOpen ? 0 : offcanvasX }}
      aria-hidden={inspectorOpen ? undefined : true}
      aria-label={name}
      className={cn(
        "absolute right-0 w-80 z-20 my-2 flex h-full max-h-[calc(100%-1rem)] flex-col",
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
      <GlassContainer className="flex flex-col shadow-inner shadow-md rounded-md flex-1 border-t border-white dark:border-neutral-900 bg-neutral-50/10 dark:bg-black/10" glassVariant="subtle">
        {children}
      </GlassContainer>
    </motion.aside>
  )
}
