"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { accentText, AiIcon, ghostMuted } from "./shared"

export interface GeneratedBlockProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "content"
> {
  content: React.ReactNode
  isStreaming?: boolean
  onStop?: () => void
  citations?: string[]
}

export function GeneratedBlock({
  content,
  isStreaming = false,
  onStop,
  citations = [],
  className,
  ...props
}: GeneratedBlockProps): React.ReactElement {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn("border-l-2 border-amber-400/50 pl-3", className)}
      data-generated="true"
      {...props}
    >
      <div
        className={cn(
          "mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em]",
          accentText
        )}
      >
        <AiIcon className="text-[11px]" />
        GENERATED · NOT PART OF THE CORPUS
      </div>
      <div className="text-sm leading-6 text-foreground/90">
        {content}
        {isStreaming ? (
          <>
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-amber-400/80"
            />
            <Button
              className={cn("ml-2 font-normal", ghostMuted)}
              onClick={onStop}
              size="xs"
              variant="ghost"
            >
              Stop
            </Button>
          </>
        ) : null}
      </div>
      {citations.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Citations">
          {citations.map((citation) => (
            <span
              className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
              key={citation}
            >
              {citation}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
