"use client"

import { AlignLeft, ExternalLink, FileText } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { FileTypeBadge, Pill } from "@/components/ui/chat"

export interface ContextCard {
  id?: string
  title: React.ReactNode
  /** "290 characters" */
  meta?: React.ReactNode
  snippet: React.ReactNode
  file?: { name: React.ReactNode; type: string }
  icon?: React.ReactNode
}

export interface ContextCardsProps extends React.ComponentPropsWithoutRef<"div"> {
  header?: React.ReactNode
  cards: ContextCard[]
  /** Count pill; defaults to `cards.length`. */
  count?: React.ReactNode
  onOpen?: (card: ContextCard, index: number) => void
}

/**
 * Retrieved chunks: header with a count pill, then one card per chunk with
 * title, character count, snippet and the source file pill.
 *
 * @sketch "Component / Context Cards"
 */
export function ContextCards({ header = "All chunks", cards, count, onOpen, className, ...props }: ContextCardsProps): React.ReactElement {
  return (
    <div data-slot="context-cards" className={cn("flex w-[380px] max-w-full flex-col gap-2", className)} {...props}>
      <div className="flex items-center gap-2.5 px-0.5">
        <span className="text-[13px] font-semibold leading-4 text-text-primary">{header}</span>
        <Pill>{count ?? cards.length}</Pill>
      </div>
      {cards.map((card, i) => (
        <div key={card.id ?? i} className="flex flex-col gap-2 rounded-xl border border-border-default bg-surface-card p-3">
          <div className="flex items-center gap-1.5">
            <span className="text-icon [&_svg]:size-3">{card.icon ?? (i % 2 ? <AlignLeft /> : <FileText />)}</span>
            <span className="flex-1 truncate text-[13px] font-semibold leading-4 text-text-primary">{card.title}</span>
            {card.meta ? <span className="text-[11px] text-text-muted">{card.meta}</span> : null}
          </div>
          <p className="line-clamp-2 text-[12px] leading-[14px] text-text-secondary">{card.snippet}</p>
          {card.file ? (
            <button
              type="button"
              onClick={() => onOpen?.(card, i)}
              className="inline-flex h-6 w-fit max-w-full items-center gap-1.5 rounded-md bg-surface-subtle pl-2 pr-2 text-[11.5px] font-medium text-text-primary outline-none hover:bg-black/8 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/10 [&_svg]:size-2.5 [&_svg]:text-text-muted"
            >
              <FileTypeBadge className="min-w-0 px-1">{card.file.type}</FileTypeBadge>
              <span className="truncate">{card.file.name}</span>
              <ExternalLink />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
