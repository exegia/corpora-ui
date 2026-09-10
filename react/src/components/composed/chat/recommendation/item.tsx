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
} from "@/components/ui/chat"
import { Check, X } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  const [value, setValue] = useState<string[]>([])

  return (
    <Accordion onValueChange={setValue} value={value}>
      <AccordionItem
        value="item-1"
        data-slot="recommendation-card"
        className={cn("max-w-full", className)}
      >
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <StateMark state={state} />
            <div className="flex w-full flex-col items-center gap-2">
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
