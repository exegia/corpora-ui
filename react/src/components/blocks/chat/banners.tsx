"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"
import type { IDegradedBannerProps, ILockedBannerProps, IPinnedThreadBannerProps } from "./type"

export function LockedBanner({
  children = "This published corpus is locked. Ask questions here, or continue in a working draft to make changes.",
  className,
}: ILockedBannerProps): React.ReactElement {
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

export function PinnedThreadBanner({
  className,
}: IPinnedThreadBannerProps): React.ReactElement {
  return (
    <Alert className={cn("rounded-sm", className)} role="status">
      <AlertDescription className="text-xs">
        Thread follows its passage, not your view.
      </AlertDescription>
    </Alert>
  )
}



export function DegradedBanner({
  reason = "The model is unavailable right now.",
  onRetry,
  className,
}: IDegradedBannerProps): React.ReactElement {
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
