import type { SignalLevel } from "@/components/ui/chat";


export interface RecommendationOption {
  label: React.ReactNode
  status?: React.ReactNode
  signal?: SignalLevel
}

export type SuggestionState = "accepted" | "rejected" | "pending"


export interface RecommendationCardProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  title: React.ReactNode
  /** Sentence fragments around the entity and lead-time pills. */
  description: React.ReactNode
  entity?: { name: React.ReactNode; initials?: string; src?: string }
  descriptionSuffix?: React.ReactNode
  leadTime?: React.ReactNode
  options?: RecommendationOption[]
  optionsLabel?: React.ReactNode
  confidence?: SignalLevel
  confidenceLabel?: React.ReactNode
  acceptLabel?: React.ReactNode
  alternativesLabel?: React.ReactNode
  onAccept?: () => void
  onAlternatives?: () => void
  onSelectOption?: (index: number) => void
}
