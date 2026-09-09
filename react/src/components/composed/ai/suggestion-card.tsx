"use client"

import { Check, ChevronDown, Undo2, X } from "lucide-react"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react"
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
import type { AISuggestionBase, SuggestionState } from "./types"
import { Reference } from "@/components/atoms"
import { Badge } from "@/components/ui/badge";

export interface SuggestionCardProps<
  T extends AISuggestionBase = AISuggestionBase,
> extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  /** Collapsible trigger label, always visible. */
  heading: T["heading"]
  description?: T["description"]
  children?: React.ReactNode
  /**
   * Grounding reference(s) — the node, passage or source the suggestion is
   * based on. Rendered as `Reference` chips in the open body.
   */
  reference?: T["references"]
  state?: SuggestionState
  onAccept?: () => void
  onReject?: () => void
  /** Takes the card back to `pending`. Without it no Undo is offered. */
  onUndo?: () => void
  acceptLabel?: React.ReactNode
  rejectLabel?: React.ReactNode
  /** Uncontrolled initial open state of the collapsible. */
  defaultOpen?: boolean
  /** Controlled open state of the collapsible. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
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
    return <span
      className={cn("rounded-full border-[1.5px] inline-grid size-4.5 place-items-center [grid-area:1/1]", state === "accepted" ? " bg-indigo-500/80 text-white" : state === "rejected" ? "bg-foreground/30 text-muted" : "bg-transparent border-neutral-800 dark:border-neutral-300")}
      key={state}
    >
     {MotionIcon && <MotionIcon
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.4, opacity: 0 }}
        initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
        aria-hidden="true"
        className="size-3 stroke-[4]"
        transition={transition}
      />}
    </span>
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

export function SuggestionCard({
  heading,
  description,
  children,
  state = "pending",
  reference,
  onAccept,
  onReject,
  onUndo,
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

  const references = reference
    ? Array.isArray(reference)
      ? reference
      : [reference]
    : []
  const referenceNodes = references.map((item) => (
    <motion.span
      className="inline-flex max-w-full"
      key={item.id}
      layout={reduceMotion ? false : "position"}
      layoutId={`${layoutId}-reference-${item.id}`}
      transition={SPRING_LAYOUT}
    >
      <Reference href={item.url}>{item.title ?? item.url ?? item.id}</Reference>
    </motion.span>
  ))

  return (
    <LayoutGroup id={layoutId}>
      <Card
        className={cn(
          "w-full overflow-clip rounded-sm text-card-foreground",
          glassCard,
          className
        )}
        data-node-id={references.length === 1 ? references[0].id : undefined}
        data-slot="suggestion-card"
        data-state={state}
        {...props}
      >
        <Collapsible onOpenChange={handleOpenChange} open={isOpen}>
          <CollapsibleTrigger
            className="flex w-full min-w-0 cursor-pointer flex-row items-center gap-3 rounded-none px-4 py-2.5 text-left transition-colors duration-150 ease-smooth-out outline-none hover:bg-black/4 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/4"
            render={<CardHeader render={<button type="button" />} />}
          >
            <StateMark state={state} />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <span
                className={cn(
                  "w-full truncate text-xs font-semibold text-foreground",
                  state === "rejected" ? "font-light text-muted-foreground line-through" : ""
                )}
              >
                {heading}
              </span>
              {description ? (
                <span className={cn(
                  "w-full truncate text-xs leading-none font-normal text-muted-foreground",
                  state === "rejected" ? "line-through opacity-50" : ""
                )}>
                  {description}
                </span>
              ) : null}
              
            </div>
            {state === "pending" ? null : (
              <Badge
                className={cn(STATE_COLOR[state], "uppercase")}
                variant="outline"
              >
                {STATE_LABEL[state]}
              </Badge>
            )}
            <motion.span
              animate={{ rotate: isOpen ? 180 : 90 }}
              aria-hidden="true"
              className="inline-flex shrink-0 text-foreground/50"
              transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
            >
              <ChevronDown className="size-4 stroke-3" />
            </motion.span>
          </CollapsibleTrigger>

          <CollapsiblePanel
            className="duration-300 ease-smooth-out motion-reduce:transition-none"
            render={<CardPanel className="gap-0 px-0 py-0" />}
          >
            <div className="flex flex-col gap-3 px-4 pt-1 pb-3">
              {isOpen && referenceNodes.length > 0 ? (
                <div className="flex flex-wrap gap-2" data-slot="suggestion-reference">
                  {referenceNodes}
                </div>
              ) : null}
              {children ? (
                <div className="text-sm leading-[22px] text-foreground/90">
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
                      onClick={onReject}
                      size="sm"
                      variant="destructive-outline"
                    >
                      <X className="size-4 stroke-3" />
                      {rejectLabel}
                    </Button>
                    <Button onClick={onAccept} size="sm" variant="outline">
                      <Check className="size-4 stroke-3" />
                      {acceptLabel}
                    </Button>
                  </motion.div>
                ) : (
                  // Always a node, never null: `mode="wait"` only releases the
                  // leaving actions once a sibling enters behind them.
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-1 px-2 pb-1 text-xs font-normal text-success-foreground"
                    exit={{ opacity: 0, y: 4 }}
                    initial={{ opacity: 0, y: 4 }}
                    key={state}
                    transition={{ duration: 0.18, ease: EASE_IN_OUT }}
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
            </CardFooter>
          </CollapsiblePanel>
        </Collapsible>
      </Card>
    </LayoutGroup>
  )
}
