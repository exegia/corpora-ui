import type * as React from "react"
import { cn } from "@/lib/utils"

// The AI accent is a muted amber used sparingly — the ✦ icon, small labels
// and the primary Apply action. Everything else reads from theme tokens so
// the block inherits whatever surface hosts it (e.g. the shell right panel).
export const accentText = "text-amber-600 dark:text-amber-300/90"

export const accentRing = "ring-offset-0 focus-visible:ring-amber-400/40"

export const accentSolid = cn(
  "border-amber-500/60 bg-amber-400/90 text-amber-950 shadow-none hover:bg-amber-400 data-pressed:bg-amber-400 disabled:opacity-35 *:data-[slot=button-loading-indicator]:text-amber-950",
  accentRing
)

export const ghostMuted = cn(
  "text-muted-foreground hover:text-foreground",
  accentRing
)

export const mutedText = "text-[13px] leading-5 text-muted-foreground"

// Floating surfaces (scope picker list, selection popover) — theme tokens,
// not a hard-coded dark panel.
export const surface = "border bg-popover text-popover-foreground shadow-lg"

export function AiIcon({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <span aria-hidden="true" className={cn(accentText, className)}>
      ✦
    </span>
  )
}

export function CloseIcon(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function ArrowUpIcon(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 12 6-6 6 6M12 18V7" />
    </svg>
  )
}

export function formatScopeLabel(scope: {
  kind: string
  label: string
  location?: string
  range?: string
  pinned?: boolean
}): string {
  if (scope.pinned) {
    return `PINNED · ${scope.label}${scope.range ? ` ${scope.range}` : ""}`
  }
  if (scope.range && scope.kind === "passage") {
    return `${scope.label} ${scope.range} · passage`
  }
  return `${scope.label} · ${scope.kind}${scope.location ? ` · ${scope.location}` : ""}`
}
