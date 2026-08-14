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
 * buttons reveal on hover when their callbacks are provided. Swapping trades
 * the two cards with a layout morph — the strip glides up and grows into the
 * primary slot while the primary card shrinks down into the strip.
 */
export function ScaffoldPanel({
  children,
  secondary,
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
  primaryClassName,
  secondaryClassName,
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

  // Two persistent cards; which slot each occupies derives from `swapped`,
  // so a swap reorders them and `layout` animates the trade. Content stays
  // slot-bound — a card picks it up from whichever slot it lands in.
  const cards = swapped ? (["b", "a"] as const) : (["a", "b"] as const)

  return (
    <motion.section
      id="scaffold-panel"
      animate={{ opacity: 1, scale: 1 }}
      aria-label={name}
      className={cn(
        "group/panel relative flex min-w-0 flex-col gap-2.5",
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
      {cards.map((card, slot) => {
        const isPrimary = slot === 0
        if (!isPrimary && secondary == null) return null
        return (
          <motion.div
            key={card}
            className={cn(
              panelSurfaceClass,
              "overflow-hidden",
              isPrimary ? "min-h-0 flex-1" : "h-13 shrink-0",
              isPrimary ? primaryClassName : secondaryClassName
            )}
            data-slot={
              isPrimary ? "scaffold-panel-primary" : "scaffold-panel-secondary"
            }
            layout
            // motion only corrects corner distortion while the cards scale
            // when the radius is set via style, not class.
            style={{ borderRadius: 16 }}
            transition={transition}
          >
            <motion.div
              key={isPrimary ? "primary" : "secondary"}
              animate={{ opacity: 1 }}
              className="h-full"
              initial={{ opacity: 0 }}
              layout="position"
              transition={transition}
            >
              {isPrimary ? children : secondary}
            </motion.div>
          </motion.div>
        )
      })}

      {onClose && (
        <PanelCloseButton label={closeLabel} onClick={onClose} sound={sound} />
      )}
      {onSwap && secondary != null && (
        <PanelSwapButton label={swapLabel} onClick={handleSwap} sound={sound} />
      )}
    </motion.section>
  )
}
