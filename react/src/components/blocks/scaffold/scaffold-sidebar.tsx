"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { ScaffoldSidebarProps } from "./type"

/**
 * The 64px icon rail on the left edge. Transparent — it sits directly on
 * the desktop backdrop; fill it with icon buttons.
 */
export function ScaffoldSidebar({
  className,
  children,
  ...rest
}: ScaffoldSidebarProps): React.ReactElement {
  return (
    <nav
      id="scaffold-sidebar"
      aria-label="Primary"
      className={cn(
        "flex min-w-12 shrink-0 flex-col items-center gap-1 pt-10 pb-2",
        className
      )}
      data-slot="scaffold-sidebar"
      {...rest}
    >
      {children}
    </nav>
  )
}
