"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { accentRing, CloseIcon, formatScopeLabel } from "./shared"
import type { AiScope, AiScopeKind } from "./types"

export interface ScopeChipProps extends Omit<
  React.ComponentPropsWithoutRef<"span">,
  "children"
> {
  scope?: AiScope
  label?: string
  kind?: AiScopeKind
  pinned?: boolean
  removable?: boolean
  onRemove?: () => void
}

export function ScopeChip({
  scope,
  label,
  kind,
  pinned,
  removable = false,
  onRemove,
  className,
  onKeyDown,
  tabIndex,
  ...props
}: ScopeChipProps): React.ReactElement {
  const resolvedScope: AiScope = scope ?? {
    kind: kind ?? "word",
    label: label ?? "",
    pinned,
  }
  const text = formatScopeLabel(resolvedScope)

  return (
    <span
      className={cn(
        "inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-sm border border-amber-500/30 bg-amber-400/8 px-2 text-xs font-medium text-amber-700 dark:text-amber-300/90",
        resolvedScope.pinned && "border-amber-500/45 bg-amber-400/14",
        className
      )}
      data-kind={resolvedScope.kind}
      data-pinned={resolvedScope.pinned ? "" : undefined}
      data-slot="scope-chip"
      onKeyDown={(event) => {
        if (
          removable &&
          (event.key === "Backspace" || event.key === "Delete")
        ) {
          event.preventDefault()
          onRemove?.()
        }
        onKeyDown?.(event)
      }}
      tabIndex={tabIndex ?? (removable ? 0 : undefined)}
      {...props}
    >
      {resolvedScope.pinned ? <span aria-hidden="true">📌</span> : null}
      <span className="truncate">{text}</span>
      {removable ? (
        <Button
          aria-label={`Remove ${text} scope`}
          className={cn(
            "size-5 rounded-sm text-current opacity-70 hover:bg-amber-400/15 hover:text-current hover:opacity-100 data-pressed:bg-amber-400/15 sm:size-5",
            accentRing
          )}
          onClick={onRemove}
          size="icon-xs"
          variant="ghost"
        >
          <CloseIcon />
        </Button>
      ) : null}
    </span>
  )
}
