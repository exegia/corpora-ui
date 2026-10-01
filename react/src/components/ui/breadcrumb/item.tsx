"use client"

import type * as React from "react"
import BreadcrumbOverlay from "./overlay"
import type { BreadcrumbItemOverlay } from "./types"
import { cn } from "@/lib/utils"

export default function BreadcrumbItem({
  className,
  children,
  overlay,
  ...props
}: React.ComponentProps<"li"> & {
  overlay?: BreadcrumbItemOverlay
}): React.ReactElement {
  return (
    <li
      className={cn("gap-1.5 inline-flex items-center", className)}
      data-slot="breadcrumb-item"
      {...props}
    >
      {children}
      {overlay ? <BreadcrumbOverlay {...overlay} /> : null}
    </li>
  )
}
