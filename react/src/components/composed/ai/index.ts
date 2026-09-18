import { Message } from "./message"
import { StreamingText } from "./streaming-text"
import { ResearchAnswer } from "./research-answer"
import { SuggestedPrompt } from "./suggested-prompt"
import { Avatar } from "./avatar"

export type { ISuggestedPromptProps } from "./suggested-prompt"

export {
  accentRing,
  accentSolid,
  accentText,
  agentText,
  ghostMuted,
  glassCard,
  mutedText,
  surface,
} from "./shared"
export { type IStreamingTextProps, type TStreamingToken } from "./streaming-text"
export type { IResearchAnswerProps } from "./research-answer"
export type {
  IAISuggestionBase,
  IDiffRow,
  IReferenceBase,
  TSuggestionState,
} from "./types"

const AI = {
  Message,
  Avatar,
  StreamingText,
  SuggestedPrompt,
  ResearchAnswer,
}

export default AI
