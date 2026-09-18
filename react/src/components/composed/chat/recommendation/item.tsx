"use client"

import { Check, Undo2, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import {
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardFrame,
  CardFrameFooter,
  CardPanel,
} from "@/components/ui/card"
import { AvatarHandle, Signal, Tag } from "@/components/ui/chat"
import { EASE_OUT_STRONG } from "@/lib/ease"
import { cn } from "@/lib/utils"
import { Checkbox } from "./checkbox"
import { CONFIDENCE, STATE_LABEL, STATE_TONE, ACTION_MOTION, ROW_VARIANTS } from "./constant"
import type { IRecommendationItemProps } from "./types"
import { Reference } from "@/components/atoms"


/**
 * Human-in-the-loop proposal: title, description with entity + lead-time
 * pills, other options with signal bars, confidence + Accept / Alternatives.
 * Outcome mark, badge, and the pending ↔ undo swap come from SuggestionCard.
 *
 * Must render inside `Recommendation.Group`.
 *
 * @sketch "Component / Recommendation Card"
 */
export function Item({
  value,
  title,
  description,
  entity,
  leadTime,
  reference,
  options = [],
  optionsLabel = "Other options",
  confidence = "high",
  confidenceLabel,
  acceptLabel = "Accept",
  rejectLabel,
  alternativesLabel = "Alternatives",
  state = "pending",
  step,
  onAccept,
  onReject,
  onAlternatives,
  onUndo,
  onSelectOption,
  children,
  className,
  ...props
}: IRecommendationItemProps): React.ReactElement {
  const declined = state === "rejected"
  const decline = onReject ?? onAlternatives
  const declineLabel = rejectLabel ?? alternativesLabel
  const reduceMotion = useReducedMotion()
  // Options mount with the panel, so they drop in staggered on every open.
  const optionMotion = (index: number) =>
    reduceMotion
      ? {}
      : {
          animate: { opacity: 1, y: 0 },
          initial: { opacity: 0, y: 6 },
          transition: {
            delay: 0.12 + index * 0.1,
            duration: 0.3,
            ease: EASE_OUT_STRONG,
          },
        }

  return (
    <AccordionItem
      className="border-0 last:border-0"
      render={<motion.div variants={reduceMotion ? undefined : ROW_VARIANTS} />}
      value={value}
      {...props}
    >
      <CardFrame
        className={cn(
          "max-w-full [--frame-radius:var(--radius-md)]",
          className
        )}
        data-slot="recommendation-card"
        data-state={state}
      >
        <AccordionTrigger className="gap-3 px-3 py-2.5 hover:bg-black/4 dark:hover:bg-white/4 relative items-center rounded-none text-left focus-visible:ring-0">
          <Checkbox state={state} step={step} />
          <div className="min-w-0 gap-1 flex flex-1 flex-col items-start">
            <span
              className={cn(
                "leading-4 font-semibold w-full text-[14px] text-text-primary",
                declined && "font-light text-muted-foreground line-through"
              )}
            >
              {title}
            </span>
          </div>
          {state === "accepted" || state === "rejected" ? (
            <Tag className="uppercase" tone={STATE_TONE[state]}>
              {STATE_LABEL[state]}
            </Tag>
          ) : null}
        </AccordionTrigger>

        {/* `relative`: the frame's ::before veil is positioned, so an
            unpositioned panel body would paint under it and look faded. */}
        <AccordionPanel className="px-0 pb-0 relative">
          {(description || entity || leadTime) && <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-1.5 px-3 pb-3 text-[13px] leading-[18px] text-text-secondary", declined && "line-through opacity-50")}>
            {description}
            {entity && <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-surface-subtle py-0.5 pl-0.5 pr-2 text-xs font-medium text-text-primary"><AvatarHandle initials={entity.initials} size={16} src={entity.src} />{entity.name}</span>}
            {leadTime && <Tag className="rounded-full" tone="green">{leadTime}</Tag>}
          </div>}
          {reference && <div
            className={cn(
              "gap-x-1.5 gap-y-1 px-2 pb-1.5 flex w-full items-center",
              declined && "line-through opacity-50"
            )}
          >
            <Reference {...reference} />
          </div>}
          {children && <div className="px-3 py-2">{children}</div>}
          {options.length > 0 && (
            <Card className="mx-3 rounded-md before:rounded-[calc(var(--radius-md)-1px)]">
              <CardPanel className="gap-2 px-3.5 py-2.5 flex flex-col">
                <span className="leading-3 text-[11px] text-text-secondary">
                  {optionsLabel}
                </span>
                {options.map((option, index) => (
                  <motion.button
                    {...optionMotion(index)}
                    className="-mx-2 h-6 gap-2.5 px-2 hover:bg-black/4 dark:hover:bg-white/6 flex items-center rounded-md text-left text-[12.5px] leading-none text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    key={index}
                    onClick={() => onSelectOption?.(index)}
                    type="button"
                  >
                    <Signal level={option.signal ?? "low"} />
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.status ? (
                      <span className="text-[11px] text-text-muted">
                        {option.status}
                      </span>
                    ) : null}
                  </motion.button>
                ))}
              </CardPanel>
            </Card>
          )}
         
          <CardFrameFooter className="gap-2 px-4 py-3.5 relative flex items-center">
            <Signal level={confidence} />
            <span className="text-[12.5px] text-text-primary">
              {confidenceLabel ?? CONFIDENCE[confidence]}
            </span>
            <span className="gap-2 ml-auto flex items-center">
              <AnimatePresence initial={false} mode="wait">
                {state === "running" ? (
                  // The spinner in the heading already reports progress; the
                  // approval actions are gone and Undo is not offered mid-run.
                  <motion.div {...ACTION_MOTION} key="running" />
                ) : state === "pending" ? (
                  <motion.div
                    {...ACTION_MOTION}
                    className="gap-2 flex items-center"
                    key="actions"
                  >
                    <Button
                      className="px-3 font-medium sm:h-6 h-6 rounded-full text-[12px]"
                      onClick={decline}
                      size="xs"
                      variant="outline"
                    >
                      <X className="size-3 stroke-3" />
                      {declineLabel}
                    </Button>
                    <Button onClick={onAccept} size="xs" variant="default">
                      <Check className="size-3 stroke-3" />
                      {acceptLabel}
                    </Button>
                  </motion.div>
                ) : (
                  // Always a node, never null: `mode="wait"` only releases the
                  // leaving actions once a sibling enters behind them.
                  <motion.div
                    {...ACTION_MOTION}
                    className="gap-1 text-xs font-normal inline-flex items-center text-success-foreground"
                    key={state}
                  >
                    {onUndo ? (
                      <Button
                        className="text-amber-400"
                        onClick={onUndo}
                        size="xs"
                        variant="ghost"
                      >
                        <Undo2 className="size-3 stroke-3" /> Undo
                      </Button>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          </CardFrameFooter>
        </AccordionPanel>
      </CardFrame>
    </AccordionItem>
  )
}
