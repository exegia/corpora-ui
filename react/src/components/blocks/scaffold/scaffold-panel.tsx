"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import {
  SCAFFOLD_EASE,
  SCAFFOLD_MORPH_DURATION,
  SCAFFOLD_PANEL_MIN_WIDTH,
} from "./constants"
import { useAtomValue } from "jotai"

import { PanelMenuButton } from "./panel-menu-button.tsx"
import { scaffoldPanelDimmedAtom } from "./scaffold-atom"
import { useScaffoldContext } from "./scaffold-context"
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
  id,
  children,
  SecondaryPanel,
  onSwap,
  onCloseSecondary,
  name,
  swapLabel = "Swap panel content",
  sound = true,
  className,
}: ScaffoldPanelProps): React.ReactElement {
  const { scaffoldId } = useScaffoldContext()
  const reducedMotion = useReducedMotion()

  // A hovered tab spotlights its own panel — every other id'd panel fades
  // back so the pairing reads at a glance. The per-panel atom keeps a hover
  // moving between two tabs from re-rendering the panels that stay dimmed;
  // the empty-key sentinel reads false for a panel without an `id`.
  const dimmed = useAtomValue(scaffoldPanelDimmedAtom(scaffoldId, id ?? ""))

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

  // Enter/exit grow and shrink the panel's slot in the flex row: flexGrow
  // carries the width (the panel is basis-0, so `width` itself is inert on
  // the main axis) and minWidth releases the 320px floor so the slot can
  // reach zero. scaleX pins the visual anchor to the panel's center —
  // flexbox collapses a slot toward whichever edge its neighbors grow
  // from, so without it the panel would wipe from one side.
  const hidden = { flexGrow: 0, minWidth: 0, scaleX: 0, opacity: 0 }

  return (
    <motion.section
      id={id ?? "scaffold-panel"}
      animate={{
        flexGrow: 1,
        // id panels opt into responsive hiding, so each visible one can
        // hold the 320px floor — the canvas hides siblings before this
        // floor would overflow it.
        minWidth: id !== undefined ? SCAFFOLD_PANEL_MIN_WIDTH : 0,
        scaleX: 1,
        flexDirection: isSwapped ? "column-reverse" : "column",
        // The hovered tab's panel keeps full opacity; the rest fade back
        // so the tab↔panel pairing reads at a glance. Inline (not a
        // class) because motion owns this element's opacity.
        opacity: dimmed ? 0.35 : 1,
      }}
      initial={hidden}
      exit={hidden}
      style={{ originX: 0.5 }}
      aria-label={name}
      className={cn(
        "group/panel relative flex min-w-0 flex-1 flex-col w-full",
        className
      )}
      layout={"size"}
      data-slot="scaffold-panel"
      data-dimmed={dimmed ? "" : undefined}
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
