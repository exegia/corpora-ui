import type * as React from "react"
import type { TSignalLevel } from "@/components/ui/chat"

export interface IRecommendationOption {
  label: React.ReactNode
  status?: React.ReactNode
  signal?: TSignalLevel
}

export interface IRecommendationEntity {
  name: React.ReactNode
  initials?: string
  src?: string
}

export type TRecommendationState =
  | "accepted"
  | "rejected"
  | "pending"
  /** The proposal was approved and the agent is working on it. */
  | "running"

/** Shared fields of a human-in-the-loop proposal. */
export interface IRecommendationFields {
  title: React.ReactNode
  /** Sentence fragments around the entity and lead-time pills. */
  description: React.ReactNode
  entity?: IRecommendationEntity
  descriptionSuffix?: React.ReactNode
  leadTime?: React.ReactNode
  options?: IRecommendationOption[]
  optionsLabel?: React.ReactNode
  confidence?: TSignalLevel
  confidenceLabel?: React.ReactNode
  acceptLabel?: React.ReactNode
  rejectLabel?: React.ReactNode
  alternativesLabel?: React.ReactNode
  state?: TRecommendationState
  /** Number inside the pending ring, e.g. the item's position in its group. */
  step?: number
  onAccept?: () => void
  /** Skip / ignore. Wins over `onAlternatives` when both are passed. */
  onReject?: () => void
  onAlternatives?: () => void
  /** Takes the card back to `pending`. Without it no Undo is offered. */
  onUndo?: () => void
  onSelectOption?: (index: number) => void
  children?: React.ReactNode
}

export interface IRecommendationItemProps
  extends
    IRecommendationFields,
    Omit<React.ComponentPropsWithoutRef<"div">, "title" | "children"> {
  /** Accordion item identity. Required inside `Recommendation.Group`. */
  value: string
}

export interface IRecommendationCardProps extends IRecommendationFields {
  /** Accordion item identity. Auto-generated when omitted. */
  value?: string
  /** Uncontrolled initial open state. Default true — Accept lives in the body. */
  defaultOpen?: boolean
  className?: string
}
