"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"
import { accentText, mutedText } from "./shared"
import type { VersionHistoryEntry } from "./types"

// The thread's message and suggestion components are reusable on their own
// and live in `components/composed/ai`; the block re-exports them so its
// public surface is unchanged.
export {
  GeneratedBlock,
  SuggestionCard,
  UserMessage,
} from "@/components/composed/ai"
export type {
  GeneratedBlockProps,
  SuggestionCardProps,
  UserMessageProps,
} from "@/components/composed/ai"

export interface VersionHistoryRecordProps {
  entry: VersionHistoryEntry
  className?: string
}

export function VersionHistoryRecord({
  entry,
  className,
}: VersionHistoryRecordProps): React.ReactElement {
  const timestamp =
    entry.timestamp instanceof Date
      ? entry.timestamp.toLocaleString()
      : entry.timestamp
  return (
    <article
      className={cn("border-l border-border pl-3", className)}
      data-slot="version-history-record"
    >
      <p className="text-xs text-foreground/85">
        <span className={cn("font-medium", accentText)}>
          resp=&quot;{entry.responseId}&quot;
        </span>
        {entry.applyingUser ? ` · ${entry.applyingUser}` : ""}
      </p>
      <p className={cn("mt-1 text-xs", mutedText)}>
        Node <code>{entry.nodeId}</code> · v{entry.version} · {timestamp}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Previous value: <del>{entry.previousValue}</del>
      </p>
    </article>
  )
}

export interface LockedBannerProps {
  children?: React.ReactNode
  className?: string
}

export function LockedBanner({
  children = "This published corpus is locked. Ask questions here, or continue in a working draft to make changes.",
  className,
}: LockedBannerProps): React.ReactElement {
  return (
    <Alert className={cn("rounded-sm text-xs", className)} role="status">
      <AlertDescription className="text-xs">
        <span>
          <span aria-hidden="true">🔒 </span>
          {children}
        </span>
      </AlertDescription>
    </Alert>
  )
}

export interface PinnedThreadBannerProps {
  className?: string
}

export function PinnedThreadBanner({
  className,
}: PinnedThreadBannerProps): React.ReactElement {
  return (
    <Alert className={cn("rounded-sm", className)} role="status">
      <AlertDescription className="text-xs">
        Thread follows its passage, not your view.
      </AlertDescription>
    </Alert>
  )
}

export interface DegradedBannerProps {
  reason?: React.ReactNode
  onRetry?: () => void
  className?: string
}

export function DegradedBanner({
  reason = "The model is unavailable right now.",
  onRetry,
  className,
}: DegradedBannerProps): React.ReactElement {
  return (
    <Alert className={cn("rounded-sm", className)} variant="warning">
      <AlertDescription className="text-xs">{reason}</AlertDescription>
      {onRetry ? (
        <AlertAction>
          <Button
            className="font-normal"
            onClick={onRetry}
            size="xs"
            variant="outline"
          >
            Retry
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  )
}
