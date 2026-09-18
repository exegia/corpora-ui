import type {
  IChartProps,
  IComposerSuggestionsProps,
  IMarkdownProps,
  IResearchAnswerProps,
} from "@/index"
import type { TUserType } from "@/components/atoms/types"
import type { ReactNode } from "react"
import type { IRecommendationStackProps } from "@/components/blocks/types"

export type TSuggestionState = "accepted" | "rejected" | "pending"

export interface IDiffRow {
  type: "add" | "remove"
  value: ReactNode
  field?: string
}

/** A word, or an inline citation; extra fields turn the chip into a hover preview. */
export type TStreamingToken =
  | { text: string }
  | {
      cite: string
      favicon?: string
      title?: string
      description?: string
      href?: string
    }

export interface IStreamingTextProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Paragraphs, each a token list; a string is split on spaces. */
  paragraphs: (string | TStreamingToken[])[]
  /** Reveal words over time and show the caret. */
  streaming?: boolean
  /** Reveal gap in ms; defaults to the --stream-gap token (60ms). */
  wordMs?: number
}

/** Kind → props map for message content; the source of truth for `AIContentProps`. */
export interface IAIContentPropsMap {
  markdown: IMarkdownProps
  research: IResearchAnswerProps
  chart: IChartProps
  suggestion: IComposerSuggestionsProps
  recommendation: IRecommendationStackProps
}

export type TAIMessageType = keyof IAIContentPropsMap

/** Discriminated union of `{ kind } & props`, distributed over `T`. */
export type TAIContentProps<T extends TAIMessageType = TAIMessageType> = {
  [K in T]: { kind: K } & IAIContentPropsMap[K]
}[T]

export interface IAIMessageProps<T extends TAIMessageType = TAIMessageType> {
  /** Identity shown in the header. */
  user?: TUserType
  type: T
  thinking?: boolean
  /** Replaces the default `User.Info` identity row in the header. */
  AttachedContent?: React.ComponentType<TAIContentProps<T>>
  /** Props forwarded to `AttachedContent`, typed by `type`. */
  contentProps?: IAIContentPropsMap[T]
  children?: React.ReactNode
  isStreaming?: boolean
  className?: string
}

export interface IReferenceBase {
  id: string
  title?: string
  url?: string
}

export interface IAISuggestionBase {
  heading: string
  description?: string | React.ReactNode
  state?: TSuggestionState
  updatedAt?: string
  references?: IReferenceBase[] | IReferenceBase
}
