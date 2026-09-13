// The visual language (accent constants, ✦ icon, close glyph) lives with the
// reusable AI components in `components/composed/ai`; the block re-uses it
// from there.
export {
  accentRing,
  accentSolid,
  accentText,
  ghostMuted,
  mutedText,
  surface,
} from "@/components/composed/ai/shared"

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
