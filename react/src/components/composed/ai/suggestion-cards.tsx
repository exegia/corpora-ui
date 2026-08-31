"use client"

import { useId } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { accentSolid, accentText, ghostMuted, mutedText } from "./shared"
import type { DiffRow } from "./types"

/**
 * The three states of one AI suggestion: actionable (SuggestedFixCard),
 * out of date (StaleCard) and confirmed (AppliedCard).
 */

export interface SuggestedFixCardProps extends Omit<
  React.ComponentPropsWithoutRef<"article">,
  "children"
> {
  nodeId: string
  rows: DiffRow[]
  rationale: React.ReactNode
  version?: string
  onReject?: () => void
  onApply?: () => void
  applyDisabled?: boolean
  disabledReason?: string
}

export function SuggestedFixCard({
  nodeId,
  rows,
  rationale,
  version,
  onReject,
  onApply,
  applyDisabled = false,
  disabledReason,
  className,
  onKeyDown,
  ...props
}: SuggestedFixCardProps): React.ReactElement {
  const labelId = useId()
  return (
    <Card
      render={
        <article
          aria-labelledby={labelId}
          onKeyDown={(event) => {
            if (
              !applyDisabled &&
              (event.metaKey || event.ctrlKey) &&
              event.key === "Enter"
            ) {
              event.preventDefault()
              onApply?.()
            }
            onKeyDown?.(event)
          }}
          {...props}
        />
      }
      className={cn("rounded-sm p-3.5", className)}
      data-slot="suggested-fix-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-[10px] font-semibold tracking-[0.12em]",
              accentText
            )}
          >
            SUGGESTED FIX
          </p>
          <h3 className="mt-1 text-sm font-medium text-foreground" id={labelId}>
            Target node <code className={accentText}>{nodeId}</code>
          </h3>
        </div>
        {version ? (
          <span className={cn("text-[11px]", mutedText)}>v{version}</span>
        ) : null}
      </div>
      <div className="mt-3 grid gap-1.5 rounded-sm border bg-muted/40 p-2.5 font-mono text-xs">
        {rows.map((row, index) => (
          <div
            className={cn(
              "flex gap-2 rounded px-1.5 py-1",
              row.type === "add"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                : "bg-red-500/10 text-red-700 dark:text-red-200"
            )}
            key={`${row.type}-${row.field ?? ""}-${index}`}
          >
            <span aria-hidden="true" className="w-3 shrink-0 font-semibold">
              {row.type === "add" ? "+" : "−"}
            </span>
            {row.type === "add" ? (
              <ins className="no-underline">
                {row.field ? `${row.field}: ` : ""}
                {row.value}
              </ins>
            ) : (
              <del>
                {row.field ? `${row.field}: ` : ""}
                {row.value}
              </del>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 border-l-2 border-border pl-2.5">
        <p className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground">
          GENERATED RATIONALE
        </p>
        <p className={cn("mt-1", mutedText)}>{rationale}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {disabledReason ? (
          <p className="text-[11px] text-warning">{disabledReason}</p>
        ) : (
          <span className={cn("text-[11px]", mutedText)}>
            Apply writes to the working version.
          </span>
        )}
        <div className="ml-auto flex gap-1.5">
          <Button
            className={cn("font-normal", ghostMuted)}
            onClick={onReject}
            size="xs"
            variant="ghost"
          >
            Reject
          </Button>
          <Button
            aria-keyshortcuts="Meta+Enter"
            className={accentSolid}
            disabled={applyDisabled}
            onClick={onApply}
            size="xs"
          >
            Apply <kbd className="ml-1 text-[10px] opacity-65">⌘↩</kbd>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export interface StaleCardProps extends Omit<
  React.ComponentPropsWithoutRef<"article">,
  "children"
> {
  nodeId: string
  versionDelta: string
  onRevalidate?: () => void
}

export function StaleCard({
  nodeId,
  versionDelta,
  onRevalidate,
  className,
  ...props
}: StaleCardProps): React.ReactElement {
  return (
    <Alert
      className={cn("rounded-sm", className)}
      data-state="stale"
      variant="warning"
      {...props}
    >
      <AlertTitle className="text-[10px] font-semibold tracking-[0.12em] text-warning">
        STALE SUGGESTION
      </AlertTitle>
      <AlertDescription>
        <p className="text-sm text-foreground">
          Node <code>{nodeId}</code> changed {versionDelta}.
        </p>
        <p className={cn("-mt-1.5", mutedText)}>
          This fix can no longer be applied to the current version.
        </p>
      </AlertDescription>
      <AlertAction>
        <Button
          className="font-normal"
          onClick={onRevalidate}
          size="xs"
          variant="outline"
        >
          Re-validate
        </Button>
      </AlertAction>
    </Alert>
  )
}

export interface AppliedCardProps extends Omit<
  React.ComponentPropsWithoutRef<"article">,
  "children"
> {
  version: string
  onUndo?: () => void
  onViewHistory?: () => void
}

export function AppliedCard({
  version,
  onUndo,
  onViewHistory,
  className,
  onKeyDown,
  ...props
}: AppliedCardProps): React.ReactElement {
  return (
    <Alert
      className={cn("rounded-sm", className)}
      data-state="applied"
      onKeyDown={(event) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === "z"
        ) {
          event.preventDefault()
          onUndo?.()
        }
        onKeyDown?.(event)
      }}
      variant="success"
      {...props}
    >
      <AlertTitle className="text-[10px] font-semibold tracking-[0.12em] text-success">
        ✓ APPLIED — VERSION HISTORY v{version}
      </AlertTitle>
      <AlertDescription>
        <div className="flex flex-wrap gap-3 text-xs">
          <Button
            className="font-normal text-success underline-offset-2 ring-offset-0"
            onClick={onUndo}
            size="xs"
            variant="link"
          >
            Undo ⌘Z
          </Button>
          <Button
            className={cn(
              "font-normal underline-offset-2",
              ghostMuted,
              "hover:bg-transparent"
            )}
            onClick={onViewHistory}
            size="xs"
            variant="link"
          >
            View revision history
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
