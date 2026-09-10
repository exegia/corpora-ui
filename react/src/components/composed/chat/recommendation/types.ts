import type * as React from "react"
import type { SignalLevel } from "@/components/ui/chat"

export interface RecommendationOption {
  label: React.ReactNode
  status?: React.ReactNode
  signal?: SignalLevel
}

export interface RecommendationEntity {
  name: React.ReactNode
  initials?: string
  src?: string
}

export type RecommendationState = "accepted" | "rejected" | "pending"

/** Shared fields of a human-in-the-loop proposal. */
export interface RecommendationFields {
  title: React.ReactNode
  /** Sentence fragments around the entity and lead-time pills. */
  description: React.ReactNode
  entity?: RecommendationEntity
  descriptionSuffix?: React.ReactNode
  leadTime?: React.ReactNode
  options?: RecommendationOption[]
  optionsLabel?: React.ReactNode
  confidence?: SignalLevel
  confidenceLabel?: React.ReactNode
  acceptLabel?: React.ReactNode
  rejectLabel?: React.ReactNode
  alternativesLabel?: React.ReactNode
  state?: RecommendationState
  onAccept?: () => void
  /** Skip / ignore. Wins over `onAlternatives` when both are passed. */
  onReject?: () => void
  onAlternatives?: () => void
  /** Takes the card back to `pending`. Without it no Undo is offered. */
  onUndo?: () => void
  onSelectOption?: (index: number) => void
  children?: React.ReactNode
}

export interface RecommendationItemProps
  extends RecommendationFields,
    Omit<React.ComponentPropsWithoutRef<"div">, "title" | "children"> {
  /** Accordion item identity. Required inside `Recommendation.Group`. */
  value: string
}

export interface RecommendationCardProps extends RecommendationFields {
  /** Accordion item identity. Auto-generated when omitted. */
  value?: string
  /** Uncontrolled initial open state. Default true — Accept lives in the body. */
  defaultOpen?: boolean
  className?: string
}
