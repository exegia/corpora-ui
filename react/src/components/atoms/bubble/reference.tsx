"use client"

import { Link2 } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import type { ReferenceProps } from "./types";
import { Button } from "@/components/ui/button";

/**
 * "Reference 1 ↗" — a translucent tag pointing at the node, passage or
 * source a suggestion is grounded in. Follows the card it sits in.
 */
export function Reference({
  href,
  onClick,
  className,
  children,
  ...props
}: ReferenceProps): React.ReactElement {

  // The rest is forwarded: `ReferenceProps` is anchor props, so `target`,
  // `rel`, `aria-label` and friends type-check and have to land somewhere.
  return (
    <Button {...props} variant="glass" glassVariant="liquid" data-slot="reference-chip" className={cn("inline-flex border border-foreground/10 shadow-none! bg-input/30 h-6.5! pl-2 group", className)} onClick={onClick} render={href ? <a href={href} /> : undefined}>
      <Link2 size={14} className="-rotate-45 stroke-amber-600 dark:stroke-amber-400" />
      <span className="truncate text-xs text-foreground/90 group-hover:underline">{children}</span>
    </Button>
  )
}
