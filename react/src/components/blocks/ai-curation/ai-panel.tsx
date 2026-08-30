"use client"

import { useEffect, useRef } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CloseIcon, ghostOnDark, surface } from "./shared"
import { Composer, type ComposerProps } from "./composer"
import { ScopeChip } from "./scope-chip"
import { ScopePicker } from "./scope-picker"
import { SuggestedPrompts } from "./suggested-prompts"
import type { AiScope } from "./types"

export interface AiPanelProps extends Omit<
  React.ComponentPropsWithoutRef<"aside">,
  "title"
> {
  scope: AiScope
  onClose?: () => void
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
 * Full-height curation rail. Data fetching, streaming and version writes stay
 * with the host application; this component only establishes layout and the
 * focus order shared by all panel states.
 */
export function AiPanel({
  scope,
  onClose,
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
  headerTitle = "AI curation",
  className,
  onKeyDown,
  ...props
}: AiPanelProps): React.ReactElement {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <aside
      aria-label={headerTitle}
      className={cn(
        "flex h-full min-h-[32rem] w-full max-w-md flex-col",
        surface,
        className
      )}
      data-slot="ai-panel"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          onClose?.()
        }
        onKeyDown?.(event)
      }}
      {...props}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3">
        <Button
          aria-label="Close AI curation panel"
          className={cn("order-3", ghostOnDark)}
          onClick={onClose}
          ref={closeRef}
          size="icon-xs"
          variant="ghost"
        >
          <CloseIcon />
        </Button>
        <h2 className="order-1 flex-1 text-sm font-semibold text-white">
          {headerTitle}
        </h2>
        <Button
          className={cn("order-2 font-normal", ghostOnDark)}
          onClick={onNewThread}
          size="xs"
          variant="ghost"
        >
          New thread
        </Button>
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b border-white/8 px-4 py-3">
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

      {locked ? (
        <p
          className="mx-4 mt-3 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs text-white/65"
          role="status"
        >
          🔒 Published corpus — answers only. Editing is disabled.
        </p>
      ) : null}

      <section
        aria-label="Thread"
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {thread}
        {!thread ? (
          <div className="flex h-full min-h-44 flex-col justify-end">
            <SuggestedPrompts onSelect={onPromptSelect} prompts={prompts} />
          </div>
        ) : null}
      </section>

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
    </aside>
  )
}
