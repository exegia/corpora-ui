"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardFrame,
  CardFrameFooter,
  CardFrameHeader,
  CardPanel,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AvatarHandle,
  Signal,
  Tag,
  type SignalLevel,
} from "@/components/ui/chat"
import { Check, X } from "lucide-react"
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface RecommendationOption {
  label: React.ReactNode
  status?: React.ReactNode
  signal?: SignalLevel
}

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

const CONFIDENCE: Record<SignalLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
}

const STATE_LABEL: Record<Exclude<SuggestionState, "pending">, string> = {
  accepted: "Done",
  rejected: "Skipped",
}

const STATE_COLOR: Record<Exclude<SuggestionState, "pending">, string> = {
  accepted: "bg-green-500",
  rejected: "bg-red-500",
}

// Hoisted: `motion.create` inside render makes a new component type on every
// pass, which remounts the mark and replays its entry animation.
const STATE_ICON = {
  accepted: motion.create(Check),
  rejected: motion.create(X),
}

/** The outcome mark: hollow while pending, violet check when accepted, grey cross when ignored. */
function StateMark({ state }: { state: SuggestionState }): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0 } : SPRING_PRESS

  const renderActions = () => {
    const MotionIcon = state === "pending" ? null : STATE_ICON[state]
    return (
      <span
        className={cn(
          "inline-grid size-3.5 place-items-center rounded-full border-[1.5px] [grid-area:1/1]",
          state === "accepted"
            ? "bg-indigo-500/80 text-white"
            : state === "rejected"
              ? "bg-foreground/30 text-muted"
              : "border-neutral-700 bg-transparent dark:border-neutral-500"
        )}
        key={state}
      >
        {MotionIcon && (
          <MotionIcon
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
            aria-hidden="true"
            className="size-3 stroke-[4]"
            transition={transition}
          />
        )}
      </span>
    )
  }
  return (
    <span
      className="relative inline-grid size-4 shrink-0 place-items-center"
      data-slot="suggestion-state"
      data-state={state}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {renderActions()}
      </AnimatePresence>
    </span>
  )
}


/**
 * Human-in-the-loop proposal: title, description with entity + lead-time
 * pills, other options with signal bars, confidence + Accept / Alternatives.
 *
 * @sketch "Component / Recommendation Card"
 */
export function RecommendationCard({
  title,
  description,
  entity,
  descriptionSuffix,
  leadTime,
  options = [],
  optionsLabel = "Other options",
  confidence = "high",
  confidenceLabel,
  acceptLabel = "Accept",
  alternativesLabel = "Alternatives",
  onAccept,
  onAlternatives,
  onSelectOption,
  className,
  ...props
}: RecommendationCardProps): React.ReactElement {

   const [value, setValue] = useState<string[]>([]);

  return (
    <Accordion    
     onValueChange={setValue} value={value}>
          <AccordionItem value="item-1" data-slot="recommendation-card"
          className={cn("max-w-full", className)}>
            <AccordionTrigger>
          <div className="flex items-center gap-2">
                  <StateMark state={state} />
                <div className="flex flex-col w-full items-center gap-2">
                  <div>{title}</div>
                  <div>{description}</div>
                </div>  
              </div>
            </AccordionTrigger>
            <AccordionPanel>
              Base UI is a library of high-quality unstyled React components for
              design systems and web apps.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How do I get started?</AccordionTrigger>
            <AccordionPanel>
              Head to the "Quick start" guide in the docs. If you've used unstyled
              libraries before, you'll feel at home.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Can I use it for my project?</AccordionTrigger>
            <AccordionPanel>
              Of course! Base UI is free and open source.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
  )
  
  return (
    <CardFrame
      data-slot="recommendation-card"
      className={cn("max-w-full", className)}
      {...props}
    >
      <CardFrameHeader className="flex flex-col gap-2 p-3">
        <span className="text-[14px] leading-4 font-semibold text-text-primary">
          {title}
        </span>
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px] leading-[15px] text-text-secondary">
          {description}
          {entity ? (
            <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-surface-subtle py-0.5 pr-2 pl-0.5 text-[12px] font-medium text-text-primary">
              <AvatarHandle
                initials={entity.initials}
                src={entity.src}
                size={16}
              />
              {entity.name}
            </span>
          ) : null}
          {descriptionSuffix}
          {leadTime ? (
            <Tag tone="green" className="rounded-full">
              {leadTime}
            </Tag>
          ) : null}
        </span>
      </CardFrameHeader>
      {options.length ? (
        <Card>
          <CardPanel className="flex flex-col gap-2 px-3.5 py-2.5">
            <span className="text-[11px] leading-3 text-text-secondary">
              {optionsLabel}
            </span>
            {options.map((o, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectOption?.(i)}
                className="flex h-6 items-center gap-2.5 rounded-md text-left text-[12.5px] leading-none text-text-primary outline-none hover:bg-black/4 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/6"
              >
                <Signal level={o.signal ?? "low"} />
                <span className="flex-1 truncate">{o.label}</span>
                {o.status ? (
                  <span className="text-[11px] text-text-muted">
                    {o.status}
                  </span>
                ) : null}
              </button>
            ))}
          </CardPanel>
        </Card>
      ) : null}
      <CardFrameFooter className="flex items-center gap-2 p-3">
        <Signal level={confidence} />
        <span className="text-[12.5px] text-text-primary">
          {confidenceLabel ?? CONFIDENCE[confidence]}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={onAlternatives}
            className="h-[27px] rounded-full px-3 text-[12px] font-medium sm:h-[27px]"
          >
            {alternativesLabel}
          </Button>
          <Button variant="default" size="xs" onClick={onAccept}>
            <Check size={12} className="stroke-3" />
            {acceptLabel}
          </Button>
        </span>
      </CardFrameFooter>
    </CardFrame>
  )
}
