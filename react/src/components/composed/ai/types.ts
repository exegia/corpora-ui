import type {
  ChartProps,
  ComposerSuggestionsProps,
  MarkdownProps,
  RecommendationStackProps,
  ResearchAnswerProps,
  UserType,
} from "@/index"
import type * as React from "react"

export type SuggestionState = "accepted" | "rejected" | "pending"

export interface DiffRow {
  type: "add" | "remove"
  value: React.ReactNode
  field?: string
}

/** A word, or an inline citation; extra fields turn the chip into a hover preview. */
export type StreamingToken =
  | { text: string }
  | {
      cite: string
      favicon?: string
      title?: string
      description?: string
      href?: string
    }

export interface StreamingTextProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Paragraphs, each a token list; a string is split on spaces. */
  paragraphs: (string | StreamingToken[])[]
  /** Reveal words over time and show the caret. */
  streaming?: boolean
  /** Reveal gap in ms; defaults to the --stream-gap token (60ms). */
  wordMs?: number
}

/** Kind → props map for message content; the source of truth for `AIContentProps`. */
export interface AIContentPropsMap {
  markdown: MarkdownProps
  research: ResearchAnswerProps
  chart: ChartProps
  suggestion: ComposerSuggestionsProps
  recommendation: RecommendationStackProps
}

export type AIMessageType = keyof AIContentPropsMap

/** Discriminated union of `{ kind } & props`, distributed over `T`. */
export type AIContentProps<T extends AIMessageType = AIMessageType> = {
  [K in T]: { kind: K } & AIContentPropsMap[K]
}[T]

export interface AIMessageProps<T extends AIMessageType = AIMessageType> {
  /** Identity shown in the header. */
  user?: UserType
  type: T
  thinking?: boolean
  /** Replaces the default `User.Info` identity row in the header. */
  AttachedContent?: React.ComponentType<AIContentProps<T>>
  /** Props forwarded to `AttachedContent`, typed by `type`. */
  contentProps?: AIContentPropsMap[T]
  children?: React.ReactNode
  isStreaming?: boolean
  className?: string
}

export interface ReferenceBase {
  id: string
  title?: string
  url?: string
}

export interface AISuggestionBase {
  heading: string
  description?: string | React.ReactNode
  state?: SuggestionState
  updatedAt?: string
  references?: ReferenceBase[] | ReferenceBase
}
