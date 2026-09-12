"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Composer, type ComposerProps } from "@/components/composed/ai/composer"
import { SuggestedPrompts } from "./suggested-prompts"
import type { AiScope } from "./types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, Plus } from "lucide-react"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip"
import Background from "@/components/atoms/background";

export interface AiPanelProps extends Omit<
  React.ComponentPropsWithoutRef<"aside">,
  "title"
> {
  scope: AiScope
  onNewThread?: () => void
  onScopeChange?: (kind: AiScope["kind"]) => void
  onRemoveScope?: () => void
  thread?: React.ReactNode
  /** Transient confirmation (e.g. ApplyToast), anchored to the bottom of the
   * thread and sized slightly narrower than the composer. */
  toast?: React.ReactNode
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
  onNewThread,
  thread,
  prompts = [],
  onPromptSelect,
  composerProps,
  locked = false,
  headerTitle = "AI panel",
  className,
  ...props
}: AiPanelProps): React.ReactElement {
  const renderLocked = () => {
    return (
      <Tooltip>
        <TooltipTrigger
          disabled={locked}
          render={
            <Button variant="ghost" size="icon-xs" className="opacity-50" />
          }
        >
          <Lock className="size-3" />
        </TooltipTrigger>
        <TooltipPopup side="bottom">
          <div>
            <div className="flex items-center gap-1">
              <Lock className="size-2.5" />
              <h6 className="text-sm">Published corpus</h6>
            </div>
            <p className="text-xs text-muted-foreground">
              Editing is disabled. Answers only.
            </p>
          </div>
        </TooltipPopup>
      </Tooltip>
    )
  }

  const renderTitle = () => {
    return (
      <div className="flex flex-1 items-center">
        <h2 className="text-sm font-semibold text-foreground">{headerTitle}</h2>
        {!locked && renderLocked()}
      </div>
    )
  }

  return (
    // A landmark, not a bare div: `aria-label` on a roleless element is not
    // exposed, so the panel would lose both its name and its region.
    <aside
      aria-label={headerTitle}
      className={cn(
        "relative flex h-full w-full flex-col bg-background",
        className
      )}
      data-slot="ai-panel"
      {...props}
    >
      <Background.Texture className="h-full w-full flex relative flex-col" >
        <header className="sticky top-0 flex shrink-0 flex-col items-center gap-2 border-b border-border bg-sidebar px-3 py-2">
          <div className="flex w-full flex-row items-center justify-between">
            {renderTitle()}
            <Button
              className={cn("font-semibold")}
              onClick={onNewThread}
              size="icon-xs"
              variant="ghost"
            >
              <Plus className="size-4 stroke-3" />
            </Button>
          </div>
        </header>

      <div className="relative min-h-0 flex-1">
        <ScrollArea aria-label="Thread" role="region" scrollFade="bottom" fill>
          {/* `w-full`, not `mx-auto`: as a flex item, auto margins shrink the
              column to fit-content, so the thread would drift off the
              composer's gutters. px-3 lines it up with the footer. */}
          <div className="flex min-h-0 flex-1 flex-col px-5">
            <div className="w-full">{thread}</div>
            {!thread && (
              <div className="flex h-full min-h-44 flex-col justify-end">
                <SuggestedPrompts onSelect={onPromptSelect} prompts={prompts} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <footer className="shrink-0 px-5 pb-3.5">
        <Composer
          {...composerProps}
          suggestedPrompts={prompts}
          disabled={locked || composerProps?.disabled}
        />
        </footer>
      </Background.Texture>
    </aside>
  )
}
