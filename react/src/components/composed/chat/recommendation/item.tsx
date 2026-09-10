"use client"

import { Check, Undo2, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import {
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardFrame,
  CardFrameFooter,
  CardPanel,
} from "@/components/ui/card"
import { AvatarHandle, Signal, Tag } from "@/components/ui/chat"
import { EASE_IN_OUT, EASE_OUT_STRONG } from "@/lib/ease"
import { cn } from "@/lib/utils"
import { Checkbox } from "./checkbox"
import { CONFIDENCE, STATE_COLOR, STATE_LABEL } from "./constant"
import type { RecommendationItemProps } from "./types"

const ACTION_MOTION = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  initial: { opacity: 0, y: 4 },
  transition: { duration: 0.18, ease: EASE_IN_OUT },
} as const

/** Row entrance, driven by the Group's staggered `visible` variant. */
const ROW_VARIANTS = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT_STRONG },
  },
} as const

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
  descriptionSuffix,
  leadTime,
  options = [],
  optionsLabel = "Other options",
  confidence = "high",
  confidenceLabel,
  acceptLabel = "Accept",
  rejectLabel,
  alternativesLabel = "Alternatives",
  state = "pending",
  onAccept,
  onReject,
  onAlternatives,
  onUndo,
  onSelectOption,
  children,
  className,
  ...props
}: RecommendationItemProps): React.ReactElement {
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
        <AccordionTrigger className="relative items-center gap-3 rounded-t-[calc(var(--radius-md)-1px)] rounded-b-none px-3 py-2.5 text-left hover:bg-black/4 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/4">
          <Checkbox state={state} />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <span
              className={cn(
                "w-full text-[14px] leading-4 font-semibold text-text-primary",
                declined && "font-light text-muted-foreground line-through"
              )}
            >
              {title}
            </span>
            <span
              className={cn(
                "flex w-full flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px] leading-[15px] text-text-secondary",
                declined && "line-through opacity-50"
              )}
            >
              {description}
              {entity ? (
                <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-surface-subtle py-0.5 pr-2 pl-0.5 text-[12px] font-medium text-text-primary">
                  <AvatarHandle
                    initials={entity.initials}
                    size={16}
                    src={entity.src}
                  />
                  {entity.name}
                </span>
              ) : null}
              {descriptionSuffix}
              {leadTime ? (
                <Tag className="rounded-full" tone="green">
                  {leadTime}
                </Tag>
              ) : null}
            </span>
          </div>
          {state === "pending" ? null : (
            <Badge
              className={cn(STATE_COLOR[state], "uppercase")}
              variant="outline"
            >
              {STATE_LABEL[state]}
            </Badge>
          )}
        </AccordionTrigger>

        <AccordionPanel className="px-0 pb-0">
          {options.length ? (
            <Card className="mx-3 rounded-md before:rounded-[calc(var(--radius-md)-1px)]">
              <CardPanel className="flex flex-col gap-2 px-3.5 py-2.5">
                <span className="text-[11px] leading-3 text-text-secondary">
                  {optionsLabel}
                </span>
                {options.map((option, index) => (
                  <motion.button
                    {...optionMotion(index)}
                    className="flex h-6 items-center gap-2.5 rounded-md text-left text-[12.5px] leading-none text-text-primary outline-none hover:bg-black/4 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/6"
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
          ) : null}
          {children ? (
            <div className="px-3 pb-2 text-sm leading-[22px] text-foreground/90">
              {children}
            </div>
          ) : null}
          <CardFrameFooter className="relative flex items-center gap-2 p-3">
            <Signal level={confidence} />
            <span className="text-[12.5px] text-text-primary">
              {confidenceLabel ?? CONFIDENCE[confidence]}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <AnimatePresence initial={false} mode="wait">
                {state === "pending" ? (
                  <motion.div
                    {...ACTION_MOTION}
                    className="flex items-center gap-2"
                    key="actions"
                  >
                    <Button
                      className="h-[27px] rounded-full px-3 text-[12px] font-medium sm:h-[27px]"
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
                    className="inline-flex items-center gap-1 text-xs font-normal text-success-foreground"
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
