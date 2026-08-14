"use client"

import { RiArrowUpDownLine } from "@remixicon/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import type { PanelFloatingButtonProps } from "./type"
import { floatingButtonClass, revealOnPanelHoverClass } from "./utils"

/**
 * Floating swap affordance centered on the seam between a panel's primary
 * surface and its secondary strip.
 */
export function PanelSwapButton({
  onClick,
  label,
  sound = true,
  className,
}: PanelFloatingButtonProps): React.ReactElement {
  return (
    <button
      id="scaffold-panel-swap-button"
      aria-label={label}
      className={cn(
        floatingButtonClass,
        revealOnPanelHoverClass,
        // Centered on the seam: secondary height (52px) + half the 10px gap.
        "absolute bottom-[57px] left-1/2 z-10 size-9 -translate-x-1/2 translate-y-1/2",
        className
      )}
      data-cuelume-press={sound ? "" : undefined}
      data-cuelume-release={sound ? "" : undefined}
      data-slot="scaffold-panel-swap"
      onClick={onClick}
      type="button"
    >
      <RiArrowUpDownLine aria-hidden className="size-4" />
    </button>
  )
}
