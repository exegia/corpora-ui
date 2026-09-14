"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Composer } from "@/components/composed/chat/composer"
import { ScrollArea } from "@/components/ui/scroll-area"
import Background from "@/components/atoms/background"
import { AiPanelHeader } from "./header"
import { SuggestedPrompts } from "./suggested-prompts"
import type { AiPanelProps } from "./types"

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
      <Background.Texture
        variant="paper"
        className="relative flex h-full w-full flex-col"
      >
        <AiPanelHeader
          locked={locked}
          onNewThread={onNewThread}
          title={headerTitle}
        />

        <div className="relative min-h-0 flex-1">
          <ScrollArea
            aria-label="Thread"
            role="region"
            scrollFade="bottom"
            fill
          >
            {/* `w-full`, not `mx-auto`: as a flex item, auto margins shrink the
              column to fit-content, so the thread would drift off the
              composer's gutters. px-3 lines it up with the footer. */}
            <div className="flex min-h-0 flex-1 flex-col px-5">
              <div className="w-full">{thread}</div>
              {!thread && (
                <div className="flex h-full min-h-44 flex-col justify-end">
                  <SuggestedPrompts
                    onSelect={onPromptSelect}
                    prompts={prompts}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <footer className="shrink-0 px-5 pb-3.5">
          <Composer
            {...composerProps}
            disabled={locked || composerProps?.disabled}
          />
        </footer>
      </Background.Texture>
    </aside>
  )
}
