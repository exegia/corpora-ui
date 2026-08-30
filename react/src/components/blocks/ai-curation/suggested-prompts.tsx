"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { accentRing, AiIcon, mutedText } from "./shared"

export interface SuggestedPromptsProps {
  prompts?: string[]
  onSelect?: (prompt: string) => void
  emptyLabel?: string
  className?: string
}

export function SuggestedPrompts({
  prompts = [],
  onSelect,
  emptyLabel = "Ask about this selection or validate it against the schema.",
  className,
}: SuggestedPromptsProps): React.ReactElement | null {
  if (!prompts.length) {
    return (
      <p className={cn("px-1 py-3", mutedText, className)} data-empty="true">
        <AiIcon className="mr-1.5" />
        {emptyLabel}
      </p>
    )
  }
  return (
    <div
      className={cn("grid gap-1.5", className)}
      aria-label="Suggested prompts"
    >
      {prompts.map((prompt) => (
        <Button
          className={cn(
            "h-auto justify-start whitespace-normal border-white/10 bg-white/4 px-3 py-2 text-left text-xs font-normal text-white/70 hover:border-[#f3ba20]/35 hover:bg-[#f3ba20]/8 hover:text-white data-pressed:bg-[#f3ba20]/8 sm:h-auto sm:text-xs",
            accentRing
          )}
          key={prompt}
          onClick={() => onSelect?.(prompt)}
          variant="ghost"
        >
          {prompt}
        </Button>
      ))}
    </div>
  )
}
