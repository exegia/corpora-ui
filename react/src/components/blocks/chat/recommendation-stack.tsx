"use client"

import type * as React from "react"
import { Group } from "@/components/ui/group"
import { cn } from "@/lib/utils"

export interface RecommendationStackProps
  extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
}

/**
 * Fuses a run of RecommendationCards into one bordered stack for the thread.
 *
 * The ui Group only fuses bordered direct children, but each card wraps its
 * frame in a borderless accordion root — so the frames are fused one level
 * down instead, and the Group-injected ::before (which would render as a
 * phantom flex item between the cards) is dropped.
 */
export function RecommendationStack({
  className,
  children,
  ...props
}: RecommendationStackProps): React.ReactElement {
  return (
    <Group
      className={cn(
        "w-full *:before:content-none",
        "[&>*:not(:last-child)_[data-slot=recommendation-card]]:rounded-b-none",
        "[&>*:not(:last-child)_[data-slot=recommendation-card]]:before:rounded-b-none",
        "[&>*+*_[data-slot=recommendation-card]]:rounded-t-none",
        "[&>*+*_[data-slot=recommendation-card]]:border-t-0",
        "[&>*+*_[data-slot=recommendation-card]]:before:rounded-t-none",
        className
      )}
      data-slot="recommendation-stack"
      orientation="vertical"
      {...props}
    >
      {children}
    </Group>
  )
}
