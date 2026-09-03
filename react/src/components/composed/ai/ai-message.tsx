"use client"

import { Sparkles } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Children, Fragment, isValidElement, useId, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PANEL } from "@/lib/ease"
import { Bubble, type BubbleHeaderProps } from "@/components/atoms/bubble"
import { Button } from "@/components/ui/button"
import { agentText, ghostMuted } from "./shared"

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
  /** Suggestion cards revealed by the "Suggestions (n)" disclosure. */
  suggestions?: React.ReactNode
  /** Overrides the count derived from `suggestions`' children. */
  suggestionCount?: number
  suggestionsLabel?: (count: number) => React.ReactNode
  defaultSuggestionsOpen?: boolean
  suggestionsOpen?: boolean
  onSuggestionsOpenChange?: (open: boolean) => void
}

/** Children.toArray, but looking through fragments so `<>{a}{b}</>` counts two. */
function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: React.ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child]
  )
}

const LIST_VARIANTS = {
  hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.97,
    transition: { duration: 0.18, ease: EASE_IN_OUT },
  },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_PANEL },
}

/**
 * An agent turn: author row, prose body and — when the model proposed
 * changes — a "Suggestions (n)" disclosure that fans the cards out below
 * with a staggered spring.
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
        className="ml-[15px] flex flex-col gap-3 border-l-0 border-border pl-5"
        data-slot="ai-message-body"
      >
        <div aria-atomic="false" aria-live="polite">
          <Bubble.Message>
            {children}
            {isStreaming ? (
              <>
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 animate-caret-blink bg-violet-400"
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
                "group/suggestions inline-flex w-fit cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm outline-none transition-colors duration-150 ease-smooth-out focus-visible:ring-1",
                agentText
              )}
              data-slot="ai-suggestions-trigger"
              onClick={() => setOpen(!open)}
              type="button"
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <motion.span
                animate={{ rotate: open ? 90 : 0, scale: open ? 1.1 : 1 }}
                className="inline-flex"
                transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
              >
                <Sparkles aria-hidden="true" className="size-4 stroke-[1.5]" />
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
                    className="flex flex-col gap-2 pt-2 pb-1"
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
