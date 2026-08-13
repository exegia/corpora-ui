"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { ScaffoldMainProps } from "./type"

/**
 * The region right of the rail. Hosts `Scaffold.Actions` (top-right),
 * `Scaffold.Canvas` and the `Scaffold.Inspector` overlay — all positioned
 * against this box.
 */
export function ScaffoldMain({
  className,
  children,
  ...rest
}: ScaffoldMainProps): React.ReactElement {
  return (
    <div
      className={cn("relative min-w-0 flex-1", className)}
      data-slot="scaffold-main"
      {...rest}
    >
      {children}
    </div>
  )
}
