import { AiPanel } from "./base"

export { AiPanel }
export { AiPanelHeader } from "./header"
export { SuggestedPrompts } from "./suggested-prompts"
export { RecommendationStack } from "./recommendation-stack"
export { DegradedBanner, LockedBanner, PinnedThreadBanner } from "./banners"
export { VersionHistoryRecord } from "./version-history-record"

export {
  AppliedMark,
  ApplyToast,
  SelectionHighlight,
  SelectionPopover,
} from "@/components/composed/reader"
export type {
  IAppliedMarkProps,
  IApplyToastProps,
  ISelectionHighlightProps,
  ISelectionPopoverProps,
} from "@/components/composed/reader"
export type {
  IAiPanelHeaderProps,
  IAiPanelProps,
  ILockedBannerProps,
  IAiScope,
  TAiScopeKind,
  TComposerMode,
  IDiffRow,
  INodeSelection,
  TSuggestionState,
  IVersionHistoryEntry,
  ISuggestedPromptsProps,
  IWordSelection,
} from "./type"

export default AiPanel
