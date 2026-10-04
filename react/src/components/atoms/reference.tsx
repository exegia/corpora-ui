"use client"

import { Link2 } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import type { IReferenceProps } from "./type"
import { Button } from "@/components/ui/button"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"

/**
 * "Reference 1 ↗" — a translucent tag pointing at the node, passage or
 * source a suggestion is grounded in. Follows the card it sits in.
 */
export function Reference({
  href,
  onClick,
  className,
  children,
  preview,
  ...props
}: IReferenceProps): React.ReactElement {
  // The rest is forwarded: `ReferenceProps` is anchor props, so `target`,
  // `rel`, `aria-label` and friends type-check and have to land somewhere.
  const chip = (
    <Button
      {...props}
      variant="glass"
      glassVariant="liquid"
      data-slot="reference-chip"
      className={cn(
        "h-6.5! pl-2 group inline-flex border border-foreground/10 bg-input/30 shadow-none!",
        className
      )}
      onClick={onClick}
      render={href ? <a href={href} /> : undefined}
    >
      <Link2
        size={14}
        className="stroke-amber-600 dark:stroke-amber-400 -rotate-45"
      />
      <span className="text-xs truncate text-foreground/90 group-hover:underline">
        {children}
      </span>
    </Button>
  )
  if (preview === undefined || preview === null) return chip
  return (
    <PreviewCard>
      <PreviewCardTrigger delay={300} render={chip} />
      <PreviewCardPopup
        className="w-72 gap-1.5 p-3 flex-col"
        data-slot="reference-preview"
      >
        <span className="font-semibold leading-4 truncate text-[11px] text-muted-foreground">
          {children}
        </span>
        <div className="border-amber-500/70 pl-2.5 text-xs leading-4 border-l-2 text-foreground/90">
          {preview}
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  )
}
