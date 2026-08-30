import type * as React from "react"
import { cn } from "@/lib/utils"

export const aiAccent = "#f3ba20"

export function AiIcon({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <span aria-hidden="true" className={cn("text-[#f3ba20]", className)}>
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

export const surface =
  "border border-white/10 bg-[#171716] text-white shadow-[0_12px_40px_rgb(0_0_0/0.28)]"

export const mutedText = "text-[13px] leading-5 text-white/55"

// Overrides that re-skin the shared `ui/button` atom for this dark surface.
export const accentRing = "ring-offset-0 focus-visible:ring-[#f3ba20]/60"

export const ghostOnDark = cn(
  "text-white/55 hover:bg-white/8 hover:text-white data-pressed:bg-white/8",
  accentRing
)

export const accentSolid = cn(
  "border-[#f3ba20] bg-[#f3ba20] text-black shadow-none hover:bg-[#ffd45d] data-pressed:bg-[#ffd45d] disabled:opacity-35 *:data-[slot=button-loading-indicator]:text-black",
  accentRing
)
