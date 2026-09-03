"use client"

import { Check, ChevronDown, X } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { useId, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardFooter, CardHeader, CardPanel } from "@/components/ui/card"
import { glassCard } from "./shared"
import type { SuggestionState } from "./types"

export interface SuggestionCardProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  /** Collapsible trigger label, always visible. */
  heading: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  nodeId: string
  state?: SuggestionState
  /**
   * Grounding reference (a `ReferenceChip`). Sits in the header while the
   * card is folded and glides down into the body when it opens.
   */
  reference?: React.ReactNode
  onAccept?: () => void
  onReject?: () => void
  acceptLabel?: React.ReactNode
  rejectLabel?: React.ReactNode
  /** Uncontrolled initial open state of the collapsible. */
  defaultOpen?: boolean
  /** Controlled open state of the collapsible. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const STATE_LABEL: Record<Exclude<SuggestionState, "pending">, string> = {
  accepted: "Accepted",
  rejected: "Ignored",
}

/** The outcome mark: hollow while pending, violet check when accepted, grey cross when ignored. */
function StateMark({ state }: { state: SuggestionState }): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0 } : SPRING_PRESS
  return (
    <span
      className="relative inline-grid size-4 shrink-0 place-items-center"
      data-slot="suggestion-state"
      data-state={state}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {state === "pending" ? (
          <motion.span
            animate={{ scale: 1, opacity: 1 }}
            className="size-4 rounded-full border-[1.5px] border-neutral-400 [grid-area:1/1] dark:border-neutral-500"
            exit={{ scale: 0.4, opacity: 0 }}
            initial={{ scale: 0.4, opacity: 0 }}
            key="pending"
            transition={transition}
          />
        ) : state === "accepted" ? (
          <motion.span
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="inline-grid size-4 place-items-center rounded-full bg-violet-500 text-white [grid-area:1/1]"
            exit={{ scale: 0.4, opacity: 0 }}
            initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
            key="accepted"
            transition={transition}
          >
            <Check aria-hidden="true" className="size-2.5 stroke-[3]" />
          </motion.span>
        ) : (
          <motion.span
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="inline-grid size-4 place-items-center rounded-full bg-neutral-500 text-white [grid-area:1/1] dark:bg-neutral-600"
            exit={{ scale: 0.4, opacity: 0 }}
            initial={{ scale: 0.4, opacity: 0, rotate: 45 }}
            key="rejected"
            transition={transition}
          >
            <X aria-hidden="true" className="size-2.5 stroke-[3]" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export function SuggestionCard({
  heading,
  description,
  children,
  nodeId,
  state = "pending",
  reference,
  onAccept,
  onReject,
  acceptLabel = "Ok, fix them",
  rejectLabel = "Ignore",
  defaultOpen = true,
  open,
  onOpenChange,
  className,
  ...props
}: SuggestionCardProps): React.ReactElement {
  const layoutId = useId()
  const reduceMotion = useReducedMotion()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = open ?? internalOpen

  const handleOpenChange = (next: boolean): void => {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const referenceNode = reference ? (
    <motion.span
      className="inline-flex max-w-full"
      layout={reduceMotion ? false : "position"}
      layoutId={`${layoutId}-reference`}
      transition={SPRING_LAYOUT}
    >
      {reference}
    </motion.span>
  ) : null

  return (
    <LayoutGroup id={layoutId}>
      <Card
        className={cn("w-full text-card-foreground", glassCard, className)}
        data-node-id={nodeId}
        data-slot="suggestion-card"
        data-state={state}
        {...props}
      >
        <Collapsible onOpenChange={handleOpenChange} open={isOpen}>
          <CollapsibleTrigger
            className="flex w-full min-w-0 cursor-pointer flex-row items-center gap-3 rounded-[15px] px-4 py-2.5 text-left outline-none transition-colors duration-150 ease-smooth-out hover:bg-black/4 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/4"
            render={<CardHeader render={<button type="button" />} />}
          >
            <StateMark state={state} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <span className="w-full truncate text-sm leading-none font-bold text-foreground">
                {heading}
              </span>
              {description ? (
                <span className="w-full truncate text-xs leading-none font-semibold text-muted-foreground">
                  {description}
                </span>
              ) : null}
            </div>
            <AnimatePresence initial={false} mode="popLayout">
              {!isOpen && referenceNode ? (
                <motion.span
                  animate={{ opacity: 1 }}
                  className="inline-flex shrink-0"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="header-reference"
                  transition={{ duration: 0.15, ease: EASE_IN_OUT }}
                >
                  {referenceNode}
                </motion.span>
              ) : null}
            </AnimatePresence>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              aria-hidden="true"
              className="inline-flex shrink-0 text-foreground/50"
              transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
            >
              <ChevronDown className="size-4" />
            </motion.span>
          </CollapsibleTrigger>

          <CollapsiblePanel
            className="ease-smooth-out duration-300 motion-reduce:transition-none"
            render={<CardPanel className="gap-0 px-0 py-0" />}
          >
            <div className="flex flex-col gap-3 px-4 pt-1 pb-3">
              {isOpen && referenceNode ? (
                <div className="flex" data-slot="suggestion-reference">
                  {referenceNode}
                </div>
              ) : null}
              {children ? (
                <div className="text-base leading-[22px] text-foreground/90">
                  {children}
                </div>
              ) : null}
            </div>
            <CardFooter className="justify-end gap-2 px-4 pt-0 pb-3">
              <AnimatePresence initial={false} mode="wait">
                {state === "pending" ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                    exit={{ opacity: 0, y: 4 }}
                    initial={{ opacity: 0, y: 4 }}
                    key="actions"
                    transition={{ duration: 0.18, ease: EASE_IN_OUT }}
                  >
                    <Button
                      className="h-8 rounded-xl border-transparent bg-neutral-300/60 px-3 text-sm font-medium text-foreground hover:bg-neutral-300 data-pressed:bg-neutral-300 dark:bg-neutral-700/70 dark:hover:bg-neutral-700 dark:data-pressed:bg-neutral-700 sm:h-8"
                      onClick={onReject}
                      size="sm"
                      variant="ghost"
                    >
                      {rejectLabel}
                    </Button>
                    <Button
                      className="h-8 rounded-xl border-black/20 bg-neutral-950 px-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-neutral-900 data-pressed:bg-neutral-900 dark:border-white/12 dark:bg-black dark:hover:bg-neutral-900 sm:h-8"
                      onClick={onAccept}
                      size="sm"
                      variant="ghost"
                    >
                      {acceptLabel}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.span
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-semibold text-muted-foreground"
                    exit={{ opacity: 0, y: 4 }}
                    initial={{ opacity: 0, y: 4 }}
                    key={state}
                    transition={{ duration: 0.18, ease: EASE_IN_OUT }}
                  >
                    {STATE_LABEL[state]}
                  </motion.span>
                )}
              </AnimatePresence>
            </CardFooter>
          </CollapsiblePanel>
        </Collapsible>
      </Card>
    </LayoutGroup>
  )
}
