"use client"

import { useReducedMotion } from "motion/react"
import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import { SPRING_LAYOUT } from "@/lib/ease.ts"
import {
  scaffoldPanelHiddenAtom,
  setScaffoldPanelHoveredAtom,
  toggleScaffoldPanelAtom,
} from "./scaffold-atom"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldTabProps } from "./type"
import { segmentVariants } from "./utils"
import { Button } from "@/components/ui/button"
import { LucideAppWindow, LucideEyeOff, LucideX } from "lucide-react"
import { GlassButtonGroup } from "@/components/ui/glasscn/glass-button-group.tsx"

/**
 * A panel's tab inside the action cluster: its label plus a close
 * affordance. Render one per open panel as Actions children, keyed —
 * closes animate out of the pill. Omit `onClose` on the last remaining
 * panel's tab; the canvas keeps at least one panel open.
 *
 * With `panelId` (matching a `Scaffold.Panel`'s `id`), the tab also fronts
 * that panel's visibility: a hidden panel dims its tab behind an eye-off
 * icon, and pressing the label toggles the panel — showing one past
 * capacity hides the least-recently-activated panel in its place.
 */
export function ScaffoldTab({
  children,
  panelId,
  onClose,
  closeLabel = "Close panel",
  sound = true,
  className,
  ...rest
}: ScaffoldTabProps): React.ReactElement {
  const { scaffoldId } = useScaffoldContext()
  // The per-panel atom keeps this tab still while its siblings toggle; the
  // empty-key sentinel reads false for a tab without a `panelId`.
  const hidden = useAtomValue(scaffoldPanelHiddenAtom(scaffoldId, panelId ?? ""))
  const togglePanel = useSetAtom(toggleScaffoldPanelAtom(scaffoldId))
  const setPanelHovered = useSetAtom(setScaffoldPanelHoveredAtom(scaffoldId))
  const reduce = useReducedMotion()
  const transition = reduce ? { duration: 0 } : SPRING_LAYOUT

  // A tab closed mid-hover never fires pointer-leave — release the
  // spotlight it holds so the canvas doesn't stay dimmed.
  React.useEffect(() => {
    if (panelId === undefined) return
    return () => setPanelHovered(panelId, false)
  }, [panelId, setPanelHovered])

  return (
    <GlassButtonGroup
      layout
      animate={reduce ? { opacity: 1, width: "auto" } : "visible"}
      data-slot="scaffold-tab"
      data-panel-hidden={hidden ? "" : undefined}
      onPointerEnter={
        panelId !== undefined ? () => setPanelHovered(panelId, true) : undefined
      }
      onPointerLeave={
        panelId !== undefined
          ? () => setPanelHovered(panelId, false)
          : undefined
      }
      exit={reduce ? { opacity: 0, width: 0 } : "exit"}
      initial={reduce ? { opacity: 0, width: 0 } : "hidden"}
      transition={transition}
      variants={segmentVariants}
      glassVariant="subtle"
      className={cn("h-full rounded-sm", className)}
      {...rest}
    >
      <Button
        aria-pressed={panelId !== undefined ? !hidden : undefined}
        onClick={panelId !== undefined ? () => togglePanel(panelId) : undefined}
        size="sm"
        sound={sound}
        variant="ghost"
        className={cn(
          "gap-2.5 rounded-sm pl-2",
          onClose && "pr-2",
          hidden && "text-muted-foreground/70"
        )}
      >
        {hidden ? <LucideEyeOff size={16} /> : <LucideAppWindow size={16} />}
        {children}
      </Button>
      {onClose && (
        <Button
          aria-label={closeLabel}
          onClick={onClose}
          size="icon-sm"
          sound={sound}
          variant="ghost"
          className="self-center rounded-none!"
        >
          <LucideX size={16} />
        </Button>
      )}
    </GlassButtonGroup>
  )
}
