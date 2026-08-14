"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_MORPH_DURATION } from "./constants"
import { PanelCloseButton } from "./panel-close-button"
import { PanelSwapButton } from "./panel-swap-button"
import type { ScaffoldPanelProps } from "./type"
import { ScaffoldSubPanel } from "@/components/blocks/scaffold/scaffold-sub-panel.tsx"

/**
 * A canvas panel: a primary card plus an optional secondary strip below it,
 * separated by a slice of the desktop backdrop. Floating close and swap
 * buttons reveal on hover when their callbacks are provided. Swapping trades
 * the two cards with a layout morph — the strip glides up and grows into the
 * primary slot while the primary card shrinks down into the strip.
 */
export function ScaffoldPanel({
  children,
  SecondaryPanel,
  onClose,
  onSwap,
  swapped: swappedProp,
  defaultSwapped = false,
  width,
  name,
  closeLabel = "Close panel",
  swapLabel = "Swap panel content",
  sound = true,
  className,
}: ScaffoldPanelProps): React.ReactElement {
  const reducedMotion = useReducedMotion()
  const [innerSwapped, setInnerSwapped] = React.useState(defaultSwapped)
  const swapped = swappedProp ?? innerSwapped

  const transition = {
    duration: reducedMotion ? 0 : SCAFFOLD_MORPH_DURATION,
    ease: SCAFFOLD_EASE,
  }

  const handleSwap = () => {
    if (swappedProp === undefined) setInnerSwapped((prev) => !prev)
    onSwap?.()
  }

  return (
    <motion.section
      id="scaffold-panel"
      animate={{ opacity: 1, scale: 1 }}
      aria-label={name}
      className={cn(
        "group/panel relative flex min-w-80 flex-col gap-2",
        width === undefined ? "flex-1" : "flex-none",
        className
      )}
      data-slot="scaffold-panel"
      data-swapped={swapped ? "" : undefined}
      exit={{ opacity: 0, scale: 0.96 }}
      initial={{ opacity: 0, scale: 0.98 }}
      layout
      style={width === undefined ? undefined : { width }}
      transition={transition}
    >
      <ScaffoldSubPanel prominence="primary">{children}</ScaffoldSubPanel>
      {SecondaryPanel && (
        <ScaffoldSubPanel prominence="secondary">{SecondaryPanel}</ScaffoldSubPanel>
      )}
      {onClose && (
        <PanelCloseButton label={closeLabel} onClick={onClose} sound={sound} />
      )}
      {onSwap && (
        <PanelSwapButton label={swapLabel} onClick={handleSwap} sound={sound} />
      )}
    </motion.section>
  )
}
