"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { accentRing, mutedText } from "./shared"
import { Sparkles } from "lucide-react"
import type { ISuggestedPromptsProps } from "./type";


export function SuggestedPrompts({
  prompts = [],
  onSelect,
  emptyLabel = "Ask about this selection or validate it against the schema.",
  className,
}: ISuggestedPromptsProps): React.ReactElement | null {
  if (!prompts.length) {
    return (
      <p className={cn("px-1 py-3", mutedText, className)} data-empty="true">
        <Sparkles className="mr-1.5" />
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
            "h-auto justify-start border bg-muted/30 px-3 py-2 text-left text-xs font-normal whitespace-normal text-muted-foreground hover:border-amber-500/30 hover:text-foreground sm:h-auto sm:text-xs",
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
