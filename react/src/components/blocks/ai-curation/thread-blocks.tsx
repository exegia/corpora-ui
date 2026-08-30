"use client"

import { useId } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { accentSolid, AiIcon, ghostOnDark, mutedText } from "./shared"
import type { DiffRow, VersionHistoryEntry } from "./types"

export interface UserMessageProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  children: React.ReactNode
}

export function UserMessage({
  children,
  className,
  ...props
}: UserMessageProps): React.ReactElement {
  return (
    <div className={cn("flex justify-end", className)} {...props}>
      <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-[#f3ba20] px-3.5 py-2.5 text-sm text-black">
        {children}
      </div>
    </div>
  )
}

export interface GeneratedBlockProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "content"
> {
  content: React.ReactNode
  isStreaming?: boolean
  onStop?: () => void
  citations?: string[]
}

export function GeneratedBlock({
  content,
  isStreaming = false,
  onStop,
  citations = [],
  className,
  ...props
}: GeneratedBlockProps): React.ReactElement {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn("border-l-2 border-[#f3ba20] pl-3", className)}
      data-generated="true"
      {...props}
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#f3ba20]">
        <AiIcon className="text-[11px]" />
        GENERATED · NOT PART OF THE CORPUS
      </div>
      <div className="text-sm leading-6 text-white/85">
        {content}
        {isStreaming ? (
          <>
            <span
              aria-hidden="true"
              className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-[#f3ba20]"
            />
            <Button
              className={cn(
                "ml-2 border-white/15 font-normal text-white/60",
                ghostOnDark
              )}
              onClick={onStop}
              size="xs"
              variant="ghost"
            >
              Stop
            </Button>
          </>
        ) : null}
      </div>
      {citations.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Citations">
          {citations.map((citation) => (
            <span
              className="rounded bg-white/7 px-1.5 py-0.5 text-[11px] text-white/50"
              key={citation}
            >
              {citation}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

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
    <article
      aria-labelledby={labelId}
      className={cn(
        "rounded-xl border border-[#f3ba20]/25 bg-[#f3ba20]/6 p-3.5",
        className
      )}
      data-slot="suggested-fix-card"
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
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#f3ba20]">
            SUGGESTED FIX
          </p>
          <h3 className="mt-1 text-sm font-medium text-white" id={labelId}>
            Target node <code className="text-[#f3ba20]">{nodeId}</code>
          </h3>
        </div>
        {version ? (
          <span className={cn("text-[11px]", mutedText)}>v{version}</span>
        ) : null}
      </div>
      <div className="mt-3 grid gap-1.5 rounded-lg border border-white/8 bg-black/15 p-2.5 font-mono text-xs">
        {rows.map((row, index) => (
          <div
            className={cn(
              "flex gap-2 rounded px-1.5 py-1",
              row.type === "add"
                ? "bg-emerald-400/8 text-emerald-200"
                : "bg-red-400/8 text-red-200"
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
      <div className="mt-3 border-l border-[#f3ba20]/45 pl-2.5">
        <p className="text-[10px] font-semibold tracking-[0.1em] text-[#f3ba20]">
          GENERATED RATIONALE
        </p>
        <p className={cn("mt-1", mutedText)}>{rationale}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        {disabledReason ? (
          <p className="text-[11px] text-amber-200/80">{disabledReason}</p>
        ) : (
          <span className={cn("text-[11px]", mutedText)}>
            Apply writes to the working version.
          </span>
        )}
        <div className="ml-auto flex gap-1.5">
          <Button
            className={cn("font-normal", ghostOnDark)}
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
    </article>
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
    <article
      className={cn(
        "rounded-xl border border-amber-300/30 bg-amber-300/8 p-3.5",
        className
      )}
      data-state="stale"
      {...props}
    >
      <p className="text-[10px] font-semibold tracking-[0.12em] text-amber-200">
        STALE SUGGESTION
      </p>
      <p className="mt-1 text-sm text-white">
        Node <code className="text-amber-200">{nodeId}</code> changed{" "}
        {versionDelta}.
      </p>
      <p className={cn("mt-1", mutedText)}>
        This fix can no longer be applied to the current version.
      </p>
      <Button
        className="mt-3 border-amber-200/30 font-normal text-amber-100 ring-offset-0 hover:bg-amber-200/10 hover:text-amber-100 data-pressed:bg-amber-200/10 focus-visible:ring-amber-200/60"
        onClick={onRevalidate}
        size="xs"
        variant="ghost"
      >
        Re-validate
      </Button>
    </article>
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
    <article
      className={cn(
        "rounded-xl border border-emerald-400/25 bg-emerald-400/8 p-3.5",
        className
      )}
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
      {...props}
    >
      <p className="text-[10px] font-semibold tracking-[0.12em] text-emerald-300">
        ✓ APPLIED — VERSION HISTORY v{version}
      </p>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <Button
          className="font-normal text-emerald-200 underline-offset-2 ring-offset-0 focus-visible:ring-emerald-200/60"
          onClick={onUndo}
          size="xs"
          variant="link"
        >
          Undo ⌘Z
        </Button>
        <Button
          className="font-normal text-white/60 underline-offset-2 ring-offset-0 hover:text-white focus-visible:ring-emerald-200/60"
          onClick={onViewHistory}
          size="xs"
          variant="link"
        >
          View revision history
        </Button>
      </div>
    </article>
  )
}

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
      className={cn("border-l border-white/15 pl-3", className)}
      data-slot="version-history-record"
    >
      <p className="text-xs text-white/80">
        <span className="font-medium text-[#f3ba20]">
          resp=&quot;{entry.responseId}&quot;
        </span>
        {entry.applyingUser ? ` · ${entry.applyingUser}` : ""}
      </p>
      <p className={cn("mt-1 text-xs", mutedText)}>
        Node <code>{entry.nodeId}</code> · v{entry.version} · {timestamp}
      </p>
      <p className="mt-2 text-xs text-white/65">
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
    <div
      className={cn(
        "rounded-lg border border-white/12 bg-white/6 px-3 py-2.5 text-xs text-white/70",
        className
      )}
      role="status"
    >
      <span aria-hidden="true">🔒 </span>
      {children}
    </div>
  )
}

export interface PinnedThreadBannerProps {
  className?: string
}

export function PinnedThreadBanner({
  className,
}: PinnedThreadBannerProps): React.ReactElement {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#f3ba20]/20 bg-[#f3ba20]/6 px-3 py-2 text-xs text-[#f3ba20]/85",
        className
      )}
      role="status"
    >
      Thread follows its passage, not your view.
    </div>
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
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/8 px-3 py-2.5 text-xs text-amber-100",
        className
      )}
      role="alert"
    >
      <span className="flex-1">{reason}</span>
      {onRetry ? (
        <Button
          className="text-amber-100 underline underline-offset-2 ring-offset-0 hover:text-amber-100 hover:no-underline data-pressed:no-underline focus-visible:ring-amber-200/60"
          onClick={onRetry}
          size="xs"
          variant="link"
        >
          Retry
        </Button>
      ) : null}
    </div>
  )
}
