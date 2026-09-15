"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Lock, Plus } from "lucide-react"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip"
import type { AiPanelHeaderProps } from "./types"

function LockedHint({ locked }: { locked?: boolean }): React.ReactElement {
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

/** The panel's sticky top row: title, lock hint and the new-thread button. */
export function AiPanelHeader({
  title,
  locked = false,
  onNewThread,
}: AiPanelHeaderProps): React.ReactElement {
  return (
    <header className="sticky top-0 flex shrink-0 flex-col items-center gap-2 border-b border-border bg-sidebar p-3.5">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-1 items-center">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {!locked && <LockedHint locked={locked} />}
        </div>
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
  )
}
