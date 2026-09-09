import type * as React from "react"
import { cn } from "@/lib/utils"

const SIZES = { 28: "size-7 rounded-lg", 32: "size-8 rounded-[10px]", 36: "size-9 rounded-[10px]", 40: "size-10 rounded-[10px]" } as const

export interface IconTileProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Tile edge in px. The design uses 40 (attachments), 32 (agent avatar), 28 (research kicker), 36 (flowchart node). */
  size?: keyof typeof SIZES
  /** Fill the tile with the accent-subtle tint instead of the neutral surface. */
  tone?: "neutral" | "accent"
}

/**
 * Square tile that frames a 16px lucide icon.
 *
 * @sketch "Atom / Icon Tile"
 */
export function IconTile({ size = 40, tone = "neutral", className, children, ...props }: IconTileProps): React.ReactElement {
  return (
    <span
      data-slot="icon-tile"
      className={cn(
        "inline-flex shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0",
        SIZES[size],
        tone === "accent" ? "bg-accent-subtle text-accent-text" : "bg-surface-subtle text-icon",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
