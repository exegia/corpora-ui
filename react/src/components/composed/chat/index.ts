export {
  Attachment,
  type AttachmentKind,
  type AttachmentProps,
  type AttachmentVariant,
} from "./attachment"
export {
  Chart,
  type ChartDatum,
  type ChartProps,
  type ChartSeries,
  type ChartType,
} from "./chart"
export {
  Markdown,
  markdownViewAtom,
  removeMarkdownInstance,
  useMarkdownView,
  type MarkdownProps,
  type MarkdownView,
} from "./markdown"
// `SuggestedPrompts`, `SendButton` and `AddButton` stay off the barrel on
// purpose: `blocks/ai-panel` and `ui/chat` already export those names, and
// all the barrels flow into `src/index.ts`. Reach them as
// `composed/chat/composer` — or hand the slots to `Composer`.
export {
  addComposerAttachmentAtom,
  clearComposerAttachmentsAtom,
  CommandMenu,
  Composer,
  composerAttachmentsAtom,
  removeComposerAttachmentAtom,
  removeComposerInstance,
  useComposerAttachmentActions,
  useComposerAttachments,
} from "./composer"
export type {
  ComposerAttachment,
  ComposerBaseProps,
  ComposerMode,
  ComposerSuggestionsProps,
  IComposerMenuProps,
  IComposerProps,
  IComposerSubmitButtonProps,
} from "./composer"
export { ResearchAnswer, type ResearchAnswerProps } from "./research-answer"
export {
  StreamingText,
  type StreamingTextProps,
  type StreamingToken,
} from "./streaming-text"
export { Recommendation, RecommendationCard } from "./recommendation"
export type {
  RecommendationCardProps,
  RecommendationCheckboxProps,
  RecommendationEntity,
  RecommendationFields,
  RecommendationGroupProps,
  RecommendationItemProps,
  RecommendationOption,
  RecommendationState,
} from "./recommendation"
export {
  ContextCards,
  type ContextCard,
  type ContextCardsProps,
} from "./context-cards"
export {
  CodeBlock,
  tokenize,
  type CodeBlockProps,
  type CodeDiffLine,
} from "./code-block"
export {
  FilterTable,
  filterTableFilterAtom,
  removeFilterTableInstance,
  type FilterTableColumn,
  type FilterTableProps,
  type FilterTableStatus,
} from "./filter-table"
export {
  RecordsTable,
  recordsTableSelectionAtom,
  removeRecordsTableInstance,
  type RecordsColumnKey,
  type RecordsRow,
  type RecordsTableProps,
} from "./records-table"
export * from "./flowchart"
export { type ChartNodeProps, type FlowchartProps } from "./flowchart"
export {
  InsightCards,
  InsightEntity,
  type Insight,
  type InsightAllocation,
  type InsightSegment,
  type InsightCardsProps,
} from "./insight-cards"
