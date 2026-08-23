"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { useAtomValue, useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_EDGE_GUTTER, SCAFFOLD_MORPH_DURATION } from "./constants"
import {
  scaffoldInspectorOpenAtom,
  toggleScaffoldInspectorAtom,
} from "./scaffold-atom"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldInspectorProps } from "./type"
import { GlassContainer } from "@/components/ui/glasscn/glass-container.tsx"
import { Button } from "@/components/ui/button"
import { LucideX } from "lucide-react"

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
  const { scaffoldId, inspectorWidth } = useScaffoldContext()
  const inspectorOpen = useAtomValue(scaffoldInspectorOpenAtom(scaffoldId))
  const toggleInspector = useSetAtom(toggleScaffoldInspectorAtom(scaffoldId))
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
        "absolute right-0 z-20 my-2 flex h-full max-h-[calc(100%-0.5rem)] w-96 flex-col",
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
      <GlassContainer
        className="flex flex-1 flex-col rounded-md border-t border-white bg-neutral-50/20 shadow-inner shadow-lg dark:border-neutral-800 dark:bg-black/5"
        glassVariant="subtle"
      >
        <div
          id="scaffold-inspector-header"
          className="flex h-12 items-center justify-between gap-2 border-b pr-3 pl-4"
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
