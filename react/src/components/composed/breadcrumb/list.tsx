"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export default function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">): React.ReactElement {
  return (
    <ol
      className={cn(
        "text-sm flex flex-wrap items-center wrap-break-word text-muted-foreground",
        className
      )}
      data-slot="breadcrumb-list"
      {...props}
    />
  )
}
