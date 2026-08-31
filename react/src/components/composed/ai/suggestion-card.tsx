"use client"

import { Check, ChevronLeftIcon, Sparkles, X } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import type { SuggestionState } from "./types"
import {
  Card,
  CardDescription,
  CardFooter,
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
          className="flex w-full min-w-0 cursor-pointer flex-row items-center px-4 py-2.5 text-left data-panel-open:[&_svg]:rotate-90"
          render={<CardHeader render={<button type="button" />} />}
        >
          <Sparkles
            size={14}
            className="shrink-0 animate-tada fill-amber-400 stroke-amber-400"
          />
          <div className="flex w-full flex-col items-start justify-start">
            <CardTitle
              render={<Text.Heading />}
              className="w-full text-left text-sm text-popover-foreground"
            >
              {heading}
            </CardTitle>
            <CardDescription
              render={<Text.Span />}
              className="w-full text-left text-xs text-muted-foreground"
            >
              {description ? `${description} - ${nodeId}` : nodeId}
            </CardDescription>
          </div>

          <ChevronLeftIcon size={20} className="opacity-40" />
        </CollapsibleTrigger>

        <CollapsiblePanel className="gap-y-2 px-0 py-0" render={<CardPanel />}>
          <div className="px-3">{children}</div>
          <CardFooter className="mx-1.5 mb-1.5 justify-end gap-1 rounded-xl px-2 py-2">
            {state === "pending" ? (
              <>
                <Button
                  onClick={onReject}
                  size="xs"
                  variant="ghost"
                  className="px-3 py-3.5 text-destructive-foreground hover:bg-destructive/5"
                >
                  <X size={14} />
                  Reject
                </Button>
                <Button
                  onClick={onAccept}
                  size="xs"
                  variant="glass"
                  className="px-3 py-3.5 text-success-foreground hover:bg-success/5"
                >
                  <Check size={14} />
                  Accept
                </Button>
              </>
            ) : (
              <Text.Label level="subtitle">
                {state === "accepted" ? "Accepted" : "Rejected"}
              </Text.Label>
            )}
          </CardFooter>
        </CollapsiblePanel>
      </Collapsible>
    </Card>
  )
}
