import { AiPanel } from "./base"

export { AiPanel }
export { AiPanelHeader } from "./header"
export { SuggestedPrompts } from "./suggested-prompts"
export { RecommendationStack } from "./recommendation-stack"
export { DegradedBanner, LockedBanner, PinnedThreadBanner } from "./banners"
export { VersionHistoryRecord } from "./version-history-record"
export type * from "./type"

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

export default AiPanel
