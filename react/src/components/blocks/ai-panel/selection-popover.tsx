"use client"

import { useEffect, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card"
import {
  accentRing,
  AiIcon,
  CloseIcon,
  ghostMuted,
  mutedText,
  surface,
} from "./shared"
import type { NodeSelection, WordSelection } from "./types"

export interface SelectionPopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variant: "word" | "node"
  word?: WordSelection
  node?: NodeSelection
  onAddToChat?: () => void
  onClose?: () => void
  /** The selected reader content — rendered as the hover/focus trigger. */
  children?: React.ReactNode
  className?: string
}

/**
 * The reader entry point, built on the preview-card atom: hovering or
 * focusing the selection reveals the card. The word and node variants
 * deliberately share one shell so there is one, and only one, AI action for
 * every kind of selection.
 */
export function SelectionPopover({
  open,
  defaultOpen = false,
  onOpenChange,
  variant,
  word,
  node,
  onAddToChat,
  onClose,
  children,
  className,
}: SelectionPopoverProps): React.ReactElement {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = open ?? internalOpen

  const handleOpenChange = (next: boolean) => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
    if (!next) onClose?.()
  }

  useEffect(() => {
    if (!isOpen) return
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault()
        onAddToChat?.()
      }
    }
    document.addEventListener("keydown", handleShortcut)
    return () => document.removeEventListener("keydown", handleShortcut)
  }, [isOpen, onAddToChat])

  return (
    <PreviewCard onOpenChange={handleOpenChange} open={isOpen}>
      {children ? (
        <PreviewCardTrigger render={<span />}>{children}</PreviewCardTrigger>
      ) : null}
      <PreviewCardPopup
        align="start"
        aria-label="Selection actions"
        className={cn(
          "w-64 flex-col overflow-hidden rounded-sm p-0",
          surface,
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 px-3.5 py-3">
          <div className="min-w-0">
            {variant === "word" && word ? (
              <>
                <p className="truncate font-medium text-foreground">{word.lemma}</p>
                <p className={mutedText}>
                  {[
                    word.partOfSpeech ?? word.pos,
                    word.frequency !== undefined && `${word.frequency}×`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </>
            ) : node ? (
              <>
                <p className="font-medium text-foreground">{node.range}</p>
                <p className={mutedText}>
                  {node.nodeIds.length} node
                  {node.nodeIds.length === 1 ? "" : "s"} · {node.wordCount}{" "}
                  words
                </p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground/70">
                  {node.nodeIds.join(" · ")}
                </p>
              </>
            ) : null}
          </div>
          {onClose ? (
            <Button
              aria-label="Close selection actions"
              className={ghostMuted}
              onClick={() => handleOpenChange(false)}
              size="icon-xs"
              variant="ghost"
            >
              <CloseIcon />
            </Button>
          ) : null}
        </div>
        {variant === "word" && word ? (
          <>
            <Separator />
            <Button
              className={cn(
                "h-auto w-full justify-start rounded-none px-3.5 py-2.5 font-normal text-muted-foreground hover:text-foreground sm:h-auto",
                accentRing
              )}
              onClick={word.onViewDetails}
              variant="ghost"
            >
              View details
            </Button>
          </>
        ) : null}
        <Separator className="mx-3.5 data-[orientation=horizontal]:w-auto" />
        <Button
          className={cn(
            "h-auto min-h-11 w-full justify-start gap-2 rounded-none px-3.5 text-amber-700 hover:bg-amber-400/8 hover:text-amber-700 dark:text-amber-300/90 dark:hover:text-amber-300/90 sm:h-auto",
            accentRing
          )}
          onClick={onAddToChat}
          variant="ghost"
        >
          <AiIcon />
          <span>Add to chat</span>
          <kbd className="ml-auto rounded-sm border border-amber-500/25 px-1.5 py-0.5 text-[10px] font-normal opacity-75">
            ⌘J
          </kbd>
        </Button>
      </PreviewCardPopup>
    </PreviewCard>
  )
}
