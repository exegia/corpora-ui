"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ghostMuted } from "./shared"
import { Composer, type ComposerProps } from "@/components/composed/ai/composer"
import { ScopeChip } from "./scope-chip"
import { ScopePicker } from "./scope-picker"
import { SuggestedPrompts } from "./suggested-prompts"
import type { AiScope } from "./types"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface AiPanelProps extends Omit<
  React.ComponentPropsWithoutRef<"aside">,
  "title"
> {
  scope: AiScope
  onNewThread?: () => void
  onScopeChange?: (kind: AiScope["kind"]) => void
  onRemoveScope?: () => void
  thread?: React.ReactNode
  prompts?: string[]
  onPromptSelect?: (prompt: string) => void
  composerProps?: ComposerProps
  scopePickerOpen?: boolean
  onScopePickerOpenChange?: (open: boolean) => void
  locked?: boolean
  headerTitle?: string
}

/**
 * Full-height curation rail, designed to sit inside a host container such as
 * the shell's right panel — it brings no surface chrome or close affordance
 * of its own. Data fetching, streaming and version writes stay with the host
 * application; this component only establishes layout and the focus order
 * shared by all panel states.
 */
export function AiPanel({
  scope,
  onNewThread,
  onScopeChange,
  onRemoveScope,
  thread,
  prompts = [],
  onPromptSelect,
  composerProps,
  scopePickerOpen,
  onScopePickerOpenChange,
  locked = false,
  headerTitle = "AI panel",
  className,
  ...props
}: AiPanelProps): React.ReactElement {
  return (
    <div
      aria-label={headerTitle}
      className={cn("flex h-full w-full flex-col bg-sidebar", className)}
      data-slot="ai-panel"
      {...props}
    >
      <header className="flex shrink-0 flex-col items-center gap-2 px-3.5 pt-3">
        <div className="flex w-full flex-row items-center justify-between">
          <h2 className="flex-1 text-sm font-semibold text-foreground">
            {headerTitle}
          </h2>
          <Button
            className={cn("font-normal", ghostMuted)}
            onClick={onNewThread}
            size="xs"
            variant="ghost"
          >
            New thread
          </Button>
        </div>
        <ScrollArea scrollFade fill>
          <div className="flex w-max shrink-0 items-center gap-2">
            <ScopeChip
              scope={scope}
              removable
              tabIndex={0}
              onRemove={onRemoveScope}
            />
            <ScopePicker
              onOpenChange={onScopePickerOpenChange}
              onValueChange={onScopeChange}
              open={scopePickerOpen}
              scope={scope}
              value={scope.kind}
            />
          </div>
        </ScrollArea>
      </header>

      {locked ? (
        <p
          className="mx-4 mt-3 rounded-sm border bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
          role="status"
        >
          🔒 Published corpus — answers only. Editing is disabled.
        </p>
      ) : null}

      <ScrollArea aria-label="Thread" scrollFade fill>
        <div className="flex min-h-0 flex-1 flex-col gap-y-2 px-5 py-4">
          {thread}
          {!thread && (
            <div className="flex h-full min-h-44 flex-col justify-end">
              <SuggestedPrompts onSelect={onPromptSelect} prompts={prompts} />
            </div>
          )}
        </div>
      </ScrollArea>

      {thread && prompts.length ? (
        <div className="shrink-0 px-4 pb-3">
          <SuggestedPrompts onSelect={onPromptSelect} prompts={prompts} />
        </div>
      ) : null}
      <footer className="shrink-0 px-4 pb-4">
        <Composer
          {...composerProps}
          disabled={locked || composerProps?.disabled}
        />
      </footer>
    </div>
  )
}
