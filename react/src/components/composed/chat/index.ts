export {
  Attachment,
  type TAttachmentKind,
  type TAttachmentProps,
  type TAttachmentVariant,
} from "./attachment"
export {
  Chart,
  type TChartDatum,
  type IChartProps,
  type IChartSeries,
  type TChartType,
} from "./chart"
export {
  Markdown,
  markdownViewAtom,
  removeMarkdownInstance,
  useMarkdownView,
  type IMarkdownProps,
  type TMarkdownView,
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
  TComposerAttachment,
  IComposerBaseProps,
  TComposerMode,
  IComposerSuggestionsProps,
  IComposerMenuProps,
  IComposerProps,
  IComposerSubmitButtonProps,
} from "./composer"

export { Recommendation, RecommendationCard } from "./recommendation"
export type {
  IRecommendationCardProps,
  IRecommendationCheckboxProps,
  IRecommendationEntity,
  IRecommendationFields,
  TRecommendationGroupProps,
  IRecommendationItemProps,
  IRecommendationOption,
  TRecommendationState,
} from "./recommendation"
export {
  ContextCards,
  type IContextCard,
  type IContextCardsProps,
} from "./context-cards"
export {
  CodeBlock,
  tokenize,
  type ICodeBlockProps,
  type ICodeDiffLine,
} from "./code-block"
export {
  FilterTable,
  filterTableFilterAtom,
  removeFilterTableInstance,
  type IFilterTableColumn,
  type IFilterTableProps,
  type IFilterTableStatus,
} from "./filter-table"
export {
  RecordsTable,
  recordsTableSelectionAtom,
  removeRecordsTableInstance,
  type TRecordsColumnKey,
  type IRecordsRow,
  type IRecordsTableProps,
} from "./records-table"
export * from "./flowchart"
export { type IChartNodeProps, type IFlowchartProps } from "./flowchart"
export {
  InsightCards,
  InsightEntity,
  type IInsight,
  type IInsightAllocation,
  type IInsightSegment,
  type IInsightCardsProps,
} from "./insight-cards"

export { SendHint } from "./hint"
