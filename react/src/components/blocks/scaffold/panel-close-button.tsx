"use client"

import { RiCloseLine } from "@remixicon/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import type { PanelFloatingButtonProps } from "./type"
import { floatingButtonClass, revealOnPanelHoverClass } from "./utils"

/** Floating close affordance in a panel's top-right corner. */
export function PanelCloseButton({
  onClick,
  label,
  sound = true,
  className,
}: PanelFloatingButtonProps): React.ReactElement {
  return (
    <button
      id="scaffold-panel-close-button"
      aria-label={label}
      className={cn(
        floatingButtonClass,
        revealOnPanelHoverClass,
        "absolute top-4 right-3.5 z-10",
        className
      )}
      data-cuelume-press={sound ? "" : undefined}
      data-cuelume-release={sound ? "" : undefined}
      data-slot="scaffold-panel-close"
      onClick={onClick}
      type="button"
    >
      <RiCloseLine aria-hidden className="size-4" />
    </button>
  )
}
