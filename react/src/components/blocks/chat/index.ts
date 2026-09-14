import { AiPanel } from "./base"

export { AiPanel }
export { AiPanelHeader } from "./header"
export { SuggestedPrompts } from "./suggested-prompts"
export { RecommendationStack } from "./recommendation-stack"
export type { RecommendationStackProps } from "./recommendation-stack"
export { DegradedBanner, LockedBanner, PinnedThreadBanner } from "./banners"
export type { DegradedBannerProps, PinnedThreadBannerProps } from "./banners"
export { VersionHistoryRecord } from "./version-history-record"

export {
  AppliedMark,
  ApplyToast,
  SelectionHighlight,
  SelectionPopover,
} from "@/components/composed/reader"
export type {
  AppliedMarkProps,
  ApplyToastProps,
  SelectionHighlightProps,
  SelectionPopoverProps,
} from "@/components/composed/reader"
export type {
  AiPanelHeaderProps,
  AiPanelProps,
  LockedBannerProps,
  AiScope,
  AiScopeKind,
  ComposerMode,
  DiffRow,
  NodeSelection,
  SuggestionState,
  VersionHistoryEntry,
  SuggestedPromptsProps,
  WordSelection,
} from "./types"

export default AiPanel
