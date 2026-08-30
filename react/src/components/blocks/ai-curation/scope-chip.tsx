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
        "inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-md border border-[#f3ba20]/35 bg-[#f3ba20]/12 px-2 text-xs font-medium text-[#f3ba20]",
        resolvedScope.pinned && "border-[#f3ba20]/55 bg-[#f3ba20]/18",
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
            "size-5 rounded-sm text-[#f3ba20]/70 hover:bg-[#f3ba20]/20 hover:text-[#f3ba20] data-pressed:bg-[#f3ba20]/20 sm:size-5",
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
