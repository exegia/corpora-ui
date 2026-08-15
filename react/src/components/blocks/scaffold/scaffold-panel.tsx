"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_EASE, SCAFFOLD_MORPH_DURATION } from "./constants"
import { PanelMenuButton } from "./panel-menu-button.tsx"
import type { ScaffoldPanelProps, TSubPanelPosition } from "./type"
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
  onSwap,
  onCloseSecondary,
  name,
  swapLabel = "Swap panel content",
  sound = true,
  className,
}: ScaffoldPanelProps): React.ReactElement {
  const reducedMotion = useReducedMotion()

  const transition = {
    duration: reducedMotion ? 0 : SCAFFOLD_MORPH_DURATION,
    ease: SCAFFOLD_EASE,
  }

  const [subPanelPosition, setSubPanelPosition] =
    useState<TSubPanelPosition>("top")
  const [isSwapped, setIsSwapped] = useState<boolean>(false)
  const handleSwap = () => {
    setIsSwapped((prev) => !prev)
    onSwap?.()
  }

  // Trades which sub-panel holds the flexible slot — the collapsed card grows
  // into `flex-1` while the expanded one shrinks to the `min-h-14` strip.
  const handleExpand = () => {
    setSubPanelPosition((prev) => (prev === "top" ? "bottom" : "top"))
  }

  return (
    <motion.section
      id="scaffold-panel"
      animate={{ flexDirection: isSwapped ? "column-reverse" : "column" }}
      aria-label={name}
      className={cn(
        "group/panel relative flex min-w-0 flex-1 flex-col",
        className
      )}
      layout
      data-slot="scaffold-panel"
      data-swapped={isSwapped ? "" : undefined}
      transition={transition}
    >
      <ScaffoldSubPanel id="top" expanded={subPanelPosition === "top"} primary>
        {children}
      </ScaffoldSubPanel>
      {(onSwap || onCloseSecondary) && SecondaryPanel && (
        <div className="relative flex h-2 items-center justify-center">
          <PanelMenuButton
            label={swapLabel}
            onClick={handleSwap}
            onExpand={handleExpand}
            onCloseSecondary={onCloseSecondary}
            secondaryExpanded={subPanelPosition === "bottom"}
            swapped={isSwapped}
            sound={sound}
          />
        </div>
      )}
      {SecondaryPanel && (
        <ScaffoldSubPanel id="bottom" expanded={subPanelPosition === "bottom"}>
          {SecondaryPanel}
        </ScaffoldSubPanel>
      )}
    </motion.section>
  )
}
