"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"

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
