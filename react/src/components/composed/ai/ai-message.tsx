"use client"

import { Sparkles } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { isValidElement, useId, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PANEL } from "@/lib/ease"
import { Bubble, type BubbleHeaderProps } from "@/components/atoms/bubble"
import { Button } from "@/components/ui/button"
import {
  agentText,
  flattenChildren,
  ghostMuted,
  ITEM_VARIANTS,
  LIST_VARIANTS,
} from "./shared"

export interface AiMessageProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "title"
> {
  /** Author shown in the header. Omit the header entirely by passing null. */
  author?: React.ReactNode | null
  time?: React.ReactNode
  /** Role badge next to the author; "Agent" by default. */
  badge?: React.ReactNode
  avatar?: BubbleHeaderProps["avatar"]
  /** The generated prose. */
  children: React.ReactNode
  isStreaming?: boolean
  onStop?: () => void
  /** Suggestion cards revealed by the "Suggestions" disclosure. */
  suggestions?: React.ReactNode
  /** Overrides the count derived from `suggestions`' children. The default
   * label ignores it — pass `suggestionsLabel` to surface it. */
  suggestionCount?: number
  /** Names the disclosure. Plain "Suggestions" by default: the cards fan out
   * right below it, so the tally reads as noise on the trigger. */
  suggestionsLabel?: (count: number) => React.ReactNode
  defaultSuggestionsOpen?: boolean
  suggestionsOpen?: boolean
  onSuggestionsOpenChange?: (open: boolean) => void
}

/**
 * An agent turn: author row, prose body and — when the model proposed
 * changes — a "Suggestions" disclosure that fans the cards out below with a
 * staggered spring.
 */
export function AiMessage({
  author = "Assistant",
  time,
  badge = "Agent",
  avatar,
  children,
  isStreaming = false,
  onStop,
  suggestions,
  suggestionCount,
  suggestionsLabel = (_count) => `Suggestions`,
  defaultSuggestionsOpen = false,
  suggestionsOpen,
  onSuggestionsOpenChange,
  className,
  ...props
}: AiMessageProps): React.ReactElement {
  const panelId = useId()
  const reduceMotion = useReducedMotion()
  const [internalOpen, setInternalOpen] = useState(defaultSuggestionsOpen)
  const open = suggestionsOpen ?? internalOpen
  const items = flattenChildren(suggestions)
  const count = suggestionCount ?? items.length
  const hasSuggestions = count > 0 || items.length > 0

  const setOpen = (next: boolean): void => {
    if (suggestionsOpen === undefined) setInternalOpen(next)
    onSuggestionsOpenChange?.(next)
  }

  return (
    <Bubble
      className={cn(className)}
      data-slot="ai-message"
      data-streaming={isStreaming ? "" : undefined}
      variant="ai"
      {...props}
    >
      {author === null ? null : (
        <Bubble.Header avatar={avatar} badge={badge} name={author} time={time} />
      )}
      <div
        className="flex flex-col gap-3 border-l-0 border-border pl-4"
        data-slot="ai-message-body"
      >
        <div aria-atomic="false" aria-live="polite">
          <Bubble.Message>
            {children}
            {isStreaming ? (
              <>
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 animate-caret-blink bg-indigo-700 dark:bg-indigo-500"
                />
                {onStop ? (
                  <Button
                    className={cn("ml-2 font-normal", ghostMuted)}
                    onClick={onStop}
                    size="xs"
                    variant="ghost"
                  >
                    Stop
                  </Button>
                ) : null}
              </>
            ) : null}
          </Bubble.Message>
        </div>

        {hasSuggestions ? (
          <div className="-ml-5 flex flex-col" data-slot="ai-suggestions">
            <motion.button
              aria-controls={panelId}
              aria-expanded={open}
              className={cn(
                "group/suggestions inline-flex w-fit cursor-pointer pb-1 items-center gap-1 rounded-md px-1 text-xs outline-none transition-colors duration-150 ease-smooth-out focus-visible:ring-0",
                agentText,
                "text-indigo-700 dark:text-indigo-400"
              )}
              data-slot="ai-suggestions-trigger"
              onClick={() => setOpen(!open)}
              type="button"
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <motion.span
                animate={{ rotate: open ? 90 : 0, scale: open ? 1.1 : 1 }}
                className="inline-flex font-semibold"
                transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
              >
                <Sparkles
                  aria-hidden="true"
                  className="size-3 rotate-12 fill-indigo-800/30 dark:fill-indigo-600/10 stroke-[2] stroke-indigo-800 dark:stroke-indigo-400"
                />
              </motion.span>
              {suggestionsLabel(count)}
            </motion.button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                  exit={{ height: 0, opacity: 0 }}
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.32, ease: EASE_IN_OUT }
                  }
                >
                  <motion.div
                    animate="visible"
                    className="flex flex-col gap-2 py-2"
                    exit="hidden"
                    initial={reduceMotion ? false : "hidden"}
                    variants={LIST_VARIANTS}
                  >
                    {items.map((item, index) => (
                      <motion.div
                        key={isValidElement(item) && item.key != null ? item.key : index}
                        variants={reduceMotion ? undefined : ITEM_VARIANTS}
                      >
                        {item}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </Bubble>
  )
}
