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
export type { IResearchAnswerProps } from "./research-answer"
export type {
  IAISuggestionBase,
  IDiffRow,
  IReferenceBase,
  IStreamingTextProps,
  TStreamingToken,
  TSuggestionState,
} from "./type"

const AI = {
  Message,
  Avatar,
  StreamingText,
  SuggestedPrompt,
  ResearchAnswer,
}

export default AI
