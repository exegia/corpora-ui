"use client"

import { ChevronDownIcon, ChevronLeftIcon, Sparkles } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { FramePanel, FrameTitle } from "@/components/ui/frame"
import { ghostMuted } from "./shared"
import type { SuggestionState } from "./types"
import {
  Card,
  CardDescription,
  CardFooter,
  CardFrame,
  CardFrameHeader,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card"
import { Text } from "@/components/atoms"

export interface SuggestionCardProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  /** Collapsible trigger label, always visible. */
  heading: React.ReactNode
  description?: React.ReactNode
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
  description,
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
    <Card
      className={cn(
        "w-full rounded-xl rounded-bl-xs bg-background! shadow-bezel",
        className
      )}
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
        <CollapsibleTrigger
          className="flex w-full min-w-0 flex-row items-center px-4 py-2.5 data-panel-open:[&_svg]:rotate-90"
          render={<CardHeader />}
        >
          <Sparkles size={14} className="shrink-0 fill-amber-400 stroke-amber-400 animate-jelly
          " />
          <div className="flex flex-col items-start justify-start w-full">
            <CardTitle
              render={Text.Heading}
              className="text-sm text-popover-foreground text-left w-full"
            >
              {heading}
            </CardTitle>
            <CardDescription
              render={Text.Span}
              className="w-full text-left text-xs text-muted-foreground"
            >
              {description ? description : nodeId}
            </CardDescription>
          </div>

          <ChevronLeftIcon size={18} className="opacity-30" />
        </CollapsibleTrigger>

        <CollapsiblePanel render={CardPanel} className="px-3 py-0">
          {children}
          <CardFooter>
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
          </CardFooter>
        </CollapsiblePanel>
      </Collapsible>
    </Card>
  )
}
