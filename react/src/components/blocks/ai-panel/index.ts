import { AiPanel } from "./base"

export { AiPanel }
export { AiPanelHeader } from "./header"
export { ScopeChip } from "./scope-chip"
export type { ScopeChipProps } from "./scope-chip"
export { AI_SCOPE_LEVELS, ScopePicker } from "./scope-picker"
export type { ScopePickerProps } from "./scope-picker"
export { SuggestedPrompts } from "./suggested-prompts"
export type { SuggestedPromptsProps } from "./suggested-prompts"
export { RecommendationStack } from "./recommendation-stack"
export type { RecommendationStackProps } from "./recommendation-stack"
export { DegradedBanner, LockedBanner, PinnedThreadBanner } from "./banners"
export type {
  DegradedBannerProps,
  LockedBannerProps,
  PinnedThreadBannerProps,
} from "./banners"
export {
  VersionHistoryRecord,
  type VersionHistoryRecordProps,
} from "./version-history-record"

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
  AiScope,
  AiScopeKind,
  ComposerMode,
  DiffRow,
  NodeSelection,
  SuggestionState,
  VersionHistoryEntry,
  WordSelection,
} from "./types"

export default AiPanel
