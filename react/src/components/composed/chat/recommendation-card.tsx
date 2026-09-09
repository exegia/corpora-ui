"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardFrame, CardFrameFooter, CardFrameHeader, CardPanel } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AvatarHandle, Signal, Tag, type SignalLevel } from "@/components/ui/chat"

export interface RecommendationOption {
  label: React.ReactNode
  status?: React.ReactNode
  signal?: SignalLevel
}

export interface RecommendationCardProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
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

const CONFIDENCE: Record<SignalLevel, string> = { high: "High confidence", medium: "Medium confidence", low: "Low confidence" }

/**
 * Human-in-the-loop proposal: title, description with entity + lead-time
 * pills, other options with signal bars, confidence + Accept / Alternatives.
 *
 * @sketch "Component / Recommendation Card"
 */
export function RecommendationCard({
  title, description, entity, descriptionSuffix, leadTime, options = [], optionsLabel = "Other options",
  confidence = "high", confidenceLabel, acceptLabel = "Accept", alternativesLabel = "Alternatives",
  onAccept, onAlternatives, onSelectOption, className, ...props
}: RecommendationCardProps): React.ReactElement {
  return (
    <CardFrame data-slot="recommendation-card" className={cn("w-[380px] max-w-full", className)} {...props}>
      <CardFrameHeader className="flex flex-col gap-2 p-3">
        <span className="text-[14px] font-semibold leading-4 text-text-primary">{title}</span>
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px] leading-[15px] text-text-secondary">
          {description}
          {entity ? (
            <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-surface-subtle py-0.5 pl-0.5 pr-2 text-[12px] font-medium text-text-primary">
              <AvatarHandle initials={entity.initials} src={entity.src} size={16} />
              {entity.name}
            </span>
          ) : null}
          {descriptionSuffix}
          {leadTime ? <Tag tone="green" className="rounded-full">{leadTime}</Tag> : null}
        </span>
      </CardFrameHeader>
      {options.length ? (
        <Card><CardPanel className="flex flex-col gap-2 px-3.5 py-2.5">
          <span className="text-[11px] leading-3 text-text-secondary">{optionsLabel}</span>
          {options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectOption?.(i)}
              className="flex h-6 items-center gap-2.5 rounded-md text-left text-[12.5px] leading-none text-text-primary outline-none hover:bg-black/4 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/6"
            >
              <Signal level={o.signal ?? "low"} />
              <span className="flex-1 truncate">{o.label}</span>
              {o.status ? <span className="text-[11px] text-text-muted">{o.status}</span> : null}
            </button>
          ))}
        </CardPanel></Card>
      ) : null}
      <CardFrameFooter className="flex items-center gap-2 p-3">
        <Signal level={confidence} />
        <span className="text-[12.5px] text-text-primary">{confidenceLabel ?? CONFIDENCE[confidence]}</span>
        <span className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="xs" onClick={onAlternatives} className="h-[27px] rounded-full px-3 text-[12px] font-medium sm:h-[27px]">{alternativesLabel}</Button>
          <Button variant="default" size="xs" onClick={onAccept} className="h-[27px] rounded-full border-semantic-info bg-semantic-info px-3 text-[12px] font-medium text-white hover:bg-semantic-info/90 sm:h-[27px]">{acceptLabel}</Button>
        </span>
      </CardFrameFooter>
    </CardFrame>
  )
}
