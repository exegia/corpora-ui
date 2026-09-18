"use client"

import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { useId } from "react"

import { cn } from "@/lib/utils"
import {
  SCAFFOLD_EASE,
  SCAFFOLD_MORPH_DURATION,
  SCAFFOLD_PANEL_MIN_WIDTH,
} from "./constants"
import { useAtomValue, useSetAtom } from "jotai"

import { useMotionPanel } from "@/lib/use-motion-panel"
import { PanelMenuButton } from "./panel-menu-button.tsx"
import {
  scaffoldPanelDimmedAtom,
  scaffoldPanelLayoutsAtom,
  updateScaffoldPanelLayoutAtom,
  toggleScaffoldPanelAtom,
} from "./scaffold-atom"
import { useScaffoldContext } from "./scaffold-context"
import type { IScaffoldPanelProps } from "./type"
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
  _panelHidden = false,
  _panelFill = true,
  _panelWidth = 320,
  _panelMax = 640,
  _panelEnd = true,
  children,
  SecondaryPanel,
  onSwap,
  onCloseSecondary,
  name,
  swapLabel = "Swap panel content",
  sound = true,
  className,
}: IScaffoldPanelProps & {
  _panelHidden?: boolean
  _panelFill?: boolean
  _panelWidth?: number
  _panelMax?: number
  _panelEnd?: boolean
}): React.ReactElement {
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

  const generatedId = useId()
  const panelId = id ?? generatedId
  const layouts = useAtomValue(scaffoldPanelLayoutsAtom(scaffoldId))
  const updateLayout = useSetAtom(updateScaffoldPanelLayoutAtom(scaffoldId))
  const togglePanel = useSetAtom(toggleScaffoldPanelAtom(scaffoldId))
  const panelLayout = layouts[panelId] ?? {}
  const isSwapped = panelLayout.swapped ?? false
  const secondaryExpanded = panelLayout.secondaryExpanded ?? false
  const handleSwap = () => {
    updateLayout(panelId, { swapped: !isSwapped })
    onSwap?.()
  }
  const handleExpand = () =>
    updateLayout(panelId, { secondaryExpanded: !secondaryExpanded })
  const { panelRef, gripRef } = useMotionPanel({
    size: _panelWidth,
    minSize: SCAFFOLD_PANEL_MIN_WIDTH,
    maxSize: _panelMax,

    enabled: !_panelFill,
    collapsed: _panelHidden,
    overshoot: false,
    transition,
    onSizeChange: (size) => updateLayout(panelId, { width: Number(size) }),
    onCollapsedChange: id
      ? (collapsed) => {
          if (collapsed !== _panelHidden) togglePanel(id)
        }
      : undefined,
  })

  const primaryPanel = (
    <ScaffoldSubPanel
      key="top"
      id="top"
      expanded={!secondaryExpanded}
      primary
      panelId={panelId}
    >
      {children}
    </ScaffoldSubPanel>
  )
  const secondaryPanel = SecondaryPanel ? (
    <ScaffoldSubPanel
      key="bottom"
      id="bottom"
      expanded={secondaryExpanded}
      panelId={panelId}
      swapped={isSwapped}
    >
      {SecondaryPanel}
    </ScaffoldSubPanel>
  ) : null
  const seam = (onSwap || onCloseSecondary) && SecondaryPanel && (
    // `layout` keeps the seam glued to the moving boundary while the
    // cards trade places around it.
    <motion.div
      key="seam"
      layout="position"
      data-motion-panels-separator=""
      transition={transition}
      className="h-2 relative flex items-center justify-center"
    >
      <PanelMenuButton
        label={swapLabel}
        onClick={handleSwap}
        onExpand={handleExpand}
        onCloseSecondary={onCloseSecondary}
        secondaryExpanded={secondaryExpanded}
        swapped={isSwapped}
        sound={sound}
      />
    </motion.div>
  )

  return (
    <motion.section
      initial={false}
      id={id ?? "scaffold-panel"}
      ref={panelRef}
      data-motion-panels-fill={_panelFill ? "" : undefined}
      data-motion-panels-separator={_panelHidden ? "" : undefined}
      aria-hidden={_panelHidden || undefined}
      inert={_panelHidden || undefined}
      animate={{ opacity: dimmed ? 0.35 : 1 }}
      style={{
        flex: _panelFill ? "1 1 0%" : "0 0 auto",
        minWidth: 0,
        marginRight: _panelHidden ? -8 : 0,
        overflow: _panelHidden ? "clip" : undefined,
      }}
      aria-label={name}
      className={cn("group/panel min-w-0 relative flex", "flex-col", className)}
      data-slot="scaffold-panel"
      data-dimmed={dimmed ? "" : undefined}
      data-swapped={isSwapped ? "" : undefined}
      transition={transition}
    >
      {!_panelFill && (
        <div
          ref={gripRef}
          role="separator"
          aria-label={`Resize ${name ?? "panel"}`}
          aria-orientation="vertical"
          tabIndex={_panelHidden ? -1 : 0}
          className={cn(
            "inset-y-0 w-2 absolute z-10 cursor-col-resize touch-none focus-visible:outline-2 focus-visible:outline-ring",
            _panelEnd ? "-right-1" : "-left-1"
          )}
        />
      )}
      {isSwapped ? secondaryPanel : primaryPanel}
      {seam}
      {isSwapped ? primaryPanel : secondaryPanel}
    </motion.section>
  )
}
