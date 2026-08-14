"use client"

import { useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { SPRING_LAYOUT } from "@/lib/ease.ts"
import type { ScaffoldTabProps } from "./type"
import { segmentVariants } from "./utils"
import { Button } from "@/components/ui/button"
import { LucideAppWindow, LucideX } from "lucide-react"
import { GlassButtonGroup } from "@/components/ui/glasscn/glass-button-group.tsx"

/**
 * A panel's tab inside the action cluster: its label plus a close
 * affordance. Render one per open panel as Actions children, keyed —
 * closes animate out of the pill. Omit `onClose` on the last remaining
 * panel's tab; the canvas keeps at least one panel open.
 */
export function ScaffoldTab({
  children,
  onClose,
  closeLabel = "Close panel",
  sound = true,
  className,
  ...rest
}: ScaffoldTabProps): React.ReactElement {
  const reduce = useReducedMotion()
  const transition = reduce ? { duration: 0 } : SPRING_LAYOUT

  return (
    <GlassButtonGroup
      layout
      animate={reduce ? { opacity: 1 } : "visible"}
      data-slot="scaffold-tab"
      exit={reduce ? { opacity: 0 } : "exit"}
      initial={reduce ? { opacity: 0 } : "hidden"}
      transition={transition}
      variants={segmentVariants}
      glassVariant="subtle"
      className={cn("h-full rounded-sm", className)}
      {...rest}
    >
      <Button
        size="sm"
        variant="ghost"
        className={cn("gap-2.5 rounded-sm pl-2", onClose && "pr-2")}
      >
        <LucideAppWindow size={16} />
        {children}
      </Button>
      {onClose && (
        <Button
          aria-label={closeLabel}
          onClick={onClose}
          size="icon-sm"
          sound={sound}
          variant="ghost"
          className="rounded-none!"
        >
          <LucideX size="sm" />
        </Button>
      )}
    </GlassButtonGroup>
  )
}
