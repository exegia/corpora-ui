"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import type { BubbleReactionsProps } from "./types"

/**
 * Emoji reaction chips under a message. Pass `reactions` for the standard
 * chip rendering, or children for a custom row — both share the container.
 */
export function BubbleReactions({
  reactions = [],
  onToggle,
  className,
  children,
  ...props
}: BubbleReactionsProps): React.ReactElement {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      data-slot="bubble-reactions"
      {...props}
    >
      {reactions.map((reaction, index) => (
        <button
          aria-label={reaction.label}
          aria-pressed={reaction.reacted ?? false}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 rounded-full border bg-background px-1.5 py-0.5 text-[11px] leading-4 text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            reaction.reacted && "border-ring/60 bg-accent"
          )}
          key={`${reaction.label ?? String(reaction.emoji)}-${index}`}
          onClick={() => onToggle?.(reaction, index)}
          type="button"
        >
          <span aria-hidden={reaction.label ? true : undefined}>
            {reaction.emoji}
          </span>
          {reaction.count != null && reaction.count > 1 && (
            <span className="text-muted-foreground tabular-nums">
              {reaction.count}
            </span>
          )}
        </button>
      ))}
      {children}
    </div>
  )
}
