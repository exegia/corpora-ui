"use client"

import { ArrowUpRight } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"
import { cn } from "@/lib/utils"
import { Favicon } from "./badges"
import { SourceChip } from "./chips"

export interface InlineSourceProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "title"> {
  /** Domain shown in the chip ("scoopdata.io"). */
  domain: React.ReactNode
  favicon?: string
  /** Source title in the popover. */
  title?: React.ReactNode
  /** Excerpt or summary in the popover. */
  description?: React.ReactNode
  /** Opens the source in a new tab from the popover. */
  href?: string
  openLabel?: React.ReactNode
}

/**
 * Inline citation: a SourceChip that, when it carries a title, description
 * or href, opens a hover preview with an "Open source" button.
 *
 * @sketch "Atom / Inline Source"
 */
export function InlineSource({
  domain,
  favicon,
  title,
  description,
  href,
  openLabel = "Open source",
  className,
  ...props
}: InlineSourceProps): React.ReactElement {
  const chip = (
    <SourceChip
      className={cn(href || title || description ? "cursor-default" : null, className)}
      data-slot="inline-source"
      favicon={favicon}
      {...props}
    >
      {domain}
    </SourceChip>
  )
  if (!href && !title && !description) return chip

  return (
    <PreviewCard>
      <PreviewCardTrigger delay={250} render={chip} />
      <PreviewCardPopup
        className="w-72 flex-col gap-2 p-3"
        data-slot="inline-source-preview"
      >
        <span className="flex items-center gap-2">
          <Favicon src={favicon} />
          <span className="flex min-w-0 flex-col">
            {title ? (
              <span className="truncate text-xs font-semibold leading-4 text-foreground">
                {title}
              </span>
            ) : null}
            <span className="truncate font-mono text-[11px] leading-4 text-muted-foreground">
              {domain}
            </span>
          </span>
        </span>
        {description ? (
          <p className="text-xs leading-4 text-foreground/90">{description}</p>
        ) : null}
        {href ? (
          <Button
            className="self-start"
            render={<a href={href} rel="noreferrer" target="_blank" />}
            size="xs"
            variant="outline"
          >
            {openLabel}
            <ArrowUpRight className="size-3" />
          </Button>
        ) : null}
      </PreviewCardPopup>
    </PreviewCard>
  )
}
