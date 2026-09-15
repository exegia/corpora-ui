import { Message } from "./message"
import { StreamingText } from "./streaming-text"
import { ResearchAnswer } from "./research-answer"
import { SuggestedPrompt } from "./suggested-prompt"
import { Avatar } from "./avatar"

export type { SuggestedPromptProps } from "./suggested-prompt"

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
export { type StreamingTextProps, type StreamingToken } from "./streaming-text"
export type { ResearchAnswerProps } from "./research-answer"
export type {
  AISuggestionBase,
  DiffRow,
  ReferenceBase,
  SuggestionState,
} from "./types"

const AI = {
  Message,
  Avatar,
  StreamingText,
  SuggestedPrompt,
  ResearchAnswer,
}

export default AI
