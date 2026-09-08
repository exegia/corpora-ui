export { AiMessage } from "./ai-message"
export type { AiMessageProps } from "./ai-message"
export { Composer } from "./composer"
export type { ComposerProps } from "./composer"
export { GeneratedBlock } from "./generated-block"
export type { GeneratedBlockProps } from "./generated-block"
export { ReferenceChip } from "./reference-chip"
export type { ReferenceChipProps } from "./reference-chip"
export { SuggestedPrompt } from "./suggested-prompt"
export type { SuggestedPromptProps } from "./suggested-prompt"
// `SuggestedPrompts` (the disclosure) stays off the barrel on purpose:
// `blocks/ai-panel` already exports that name for its own prompt list, and
// both barrels flow into `src/index.ts`. Reach it as
// `composed/ai/suggested-prompt` — or just hand the rows to `Composer`.
export { SuggestionCard } from "./suggestion-card"
export type { SuggestionCardProps } from "./suggestion-card"
export { UserMessage } from "./user-message"
export type { UserMessageProps } from "./user-message"
export {
  accentRing,
  accentSolid,
  accentText,
  agentText,
  AiIcon,
  ArrowUpIcon,
  ghostMuted,
  glassCard,
  Kbd,
  mutedText,
  SendHint,
  surface,
} from "./shared"
export type { ComposerMode, DiffRow, SuggestionState } from "./types"
