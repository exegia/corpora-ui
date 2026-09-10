import type * as React from "react"

// The visual language (accent constants, ✦ icon) lives with the reusable AI
// components in `components/composed/ai`; the block re-uses it from there.
export {
  accentRing,
  accentSolid,
  accentText,
  AiIcon,
  ArrowUpIcon,
  ghostMuted,
  mutedText,
  surface,
} from "@/components/composed/ai/shared"

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
