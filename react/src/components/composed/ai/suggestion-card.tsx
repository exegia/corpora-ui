"use client"

import { ChevronDownIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame"
import { ghostMuted } from "./shared"
import type { SuggestionState } from "./types"

export interface SuggestionCardProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  /** Collapsible trigger label, always visible. */
  heading: React.ReactNode
  /** Panel title, shown above the content when expanded. */
  title?: React.ReactNode
  children?: React.ReactNode
  nodeId: string
  state?: SuggestionState
  onAccept?: () => void
  onReject?: () => void
  /** Uncontrolled initial open state of the collapsible. */
  defaultOpen?: boolean
  /** Controlled open state of the collapsible. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SuggestionCard({
  heading,
  title,
  children,
  nodeId,
  state = "pending",
  onAccept,
  onReject,
  defaultOpen = true,
  open,
  onOpenChange,
  className,
  ...props
}: SuggestionCardProps): React.ReactElement {
  return (
    <Frame
      className={cn("w-full", className)}
      data-node-id={nodeId}
      data-slot="suggestion-card"
      data-state={state}
      {...props}
    >
      <Collapsible
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        open={open}
      >
        <FrameHeader className="flex-row items-center justify-between gap-2 px-1 py-1">
          <CollapsibleTrigger
            className="min-w-0 justify-start font-normal data-panel-open:[&_svg]:rotate-180"
            render={<Button size="xs" variant="ghost" />}
          >
            <ChevronDownIcon />
            <span className="truncate">{heading}</span>
          </CollapsibleTrigger>
          <code className="shrink-0 pr-1 text-[11px] text-muted-foreground">
            {nodeId}
          </code>
        </FrameHeader>
        <CollapsiblePanel>
          <FramePanel className="p-3">
            {title != null && <FrameTitle>{title}</FrameTitle>}
            {children}
            <div className="mt-3 flex items-center justify-end gap-1.5">
              {state === "pending" ? (
                <>
                  <Button
                    className={cn("font-normal", ghostMuted)}
                    onClick={onReject}
                    size="xs"
                    variant="ghost"
                  >
                    Reject
                  </Button>
                  <Button onClick={onAccept} size="xs">
                    Accept
                  </Button>
                </>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  {state === "accepted" ? "Accepted" : "Rejected"}
                </span>
              )}
            </div>
          </FramePanel>
        </CollapsiblePanel>
      </Collapsible>
    </Frame>
  )
}
