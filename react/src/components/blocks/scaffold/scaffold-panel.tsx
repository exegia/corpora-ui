"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_MORPH_DURATION } from "./constants"
import { PanelCloseButton } from "./panel-close-button"
import { PanelSwapButton } from "./panel-swap-button"
import type { ScaffoldPanelProps } from "./type"
import { panelSurfaceClass } from "./utils"

/**
 * A canvas panel: a primary card plus an optional secondary strip below it,
 * separated by a slice of the desktop backdrop. Floating close and swap
 * buttons reveal on hover when their callbacks are provided.
 */
export function ScaffoldPanel({
  children,
  secondary,
  onClose,
  onSwap,
  width,
  name,
  closeLabel = "Close panel",
  swapLabel = "Swap panel content",
  sound = true,
  className,
  primaryClassName,
  secondaryClassName,
}: ScaffoldPanelProps): React.ReactElement {
  const reducedMotion = useReducedMotion()
  const transition = {
    duration: reducedMotion ? 0 : SCAFFOLD_MORPH_DURATION,
    ease: SCAFFOLD_EASE,
  }

  return (
    <motion.section
      animate={{ opacity: 1, scale: 1 }}
      aria-label={name}
      className={cn(
        "group/panel relative flex min-w-0 flex-col gap-2.5",
        width === undefined ? "flex-1" : "flex-none",
        className
      )}
      data-slot="scaffold-panel"
      exit={{ opacity: 0, scale: 0.96 }}
      initial={{ opacity: 0, scale: 0.98 }}
      layout
      style={width === undefined ? undefined : { width }}
      transition={transition}
    >
      <div
        className={cn(
          panelSurfaceClass,
          "min-h-0 flex-1 overflow-hidden",
          primaryClassName
        )}
        data-slot="scaffold-panel-primary"
      >
        {children}
      </div>

      {secondary != null && (
        <div
          className={cn(
            panelSurfaceClass,
            "h-13 shrink-0 overflow-hidden",
            secondaryClassName
          )}
          data-slot="scaffold-panel-secondary"
        >
          {secondary}
        </div>
      )}

      {onClose && (
        <PanelCloseButton label={closeLabel} onClick={onClose} sound={sound} />
      )}
      {onSwap && secondary != null && (
        <PanelSwapButton label={swapLabel} onClick={onSwap} sound={sound} />
      )}
    </motion.section>
  )
}
