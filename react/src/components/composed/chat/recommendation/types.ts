import type * as React from "react"
import type { TSignalLevel } from "@/components/ui/chat"
import type { AccordionPrimitive } from "@/components/ui/accordion"
import type { IReferenceProps } from "@/components/atoms/types"

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
  /** Collapsible body text around the entity and lead-time pills. */
  description: React.ReactNode
  entity?: IRecommendationEntity
  reference?: IReferenceProps
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

export type TRecommendationGroupProps = AccordionPrimitive.Root.Props

export interface IRecommendationCheckboxProps {
  state: TRecommendationState
  /** Number shown inside the pending ring (its position in the group). */
  step?: number
  className?: string
}
