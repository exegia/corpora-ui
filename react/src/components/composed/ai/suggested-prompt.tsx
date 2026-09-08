"use client"

import { ChevronDown, Plus, Sparkle } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react"
import { Children, Fragment, isValidElement, useId, useState } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PANEL } from "@/lib/ease"
import { ITEM_VARIANTS, LIST_VARIANTS } from "./shared"

export interface SuggestedPromptProps extends Omit<
  HTMLMotionProps<"button">,
  "children" | "onSelect"
> {
  /** The prompt itself — what the person would have typed. */
  children: React.ReactNode
  onSelect?: () => void
  /**
   * Shared-layout id. Give the resulting message bubble the same id and the
   * row flies into it when this one unmounts.
   */
  layoutId?: string
}

/**
 * One suggested prompt: a violet spark, the prompt, and a `+` marking that
 * picking it drops the prompt into the thread. The whole row is the control —
 * the `+` is an affordance, not a second action.
 */
export function SuggestedPrompt({
  children,
  onSelect,
  layoutId,
  className,
  ...props
}: SuggestedPromptProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  return (
    <motion.button
      className={cn(
        "group/prompt flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left text-sm text-foreground/90 outline-none transition-colors duration-150 ease-smooth-out hover:bg-foreground/5 focus-visible:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      data-slot="suggested-prompt"
      layoutId={reduceMotion ? undefined : layoutId}
      onClick={onSelect}
      type="button"
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      {...props}
    >
      <Sparkle
        aria-hidden="true"
        className="size-3.5 shrink-0 fill-violet-500/30 stroke-[1.5] stroke-violet-600 dark:fill-violet-400/20 dark:stroke-violet-400"
      />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <Plus
        aria-hidden="true"
        className="size-3.5 shrink-0 stroke-2 text-muted-foreground/60 transition-colors duration-150 ease-smooth-out group-hover/prompt:text-foreground"
      />
    </motion.button>
  )
}

export interface SuggestedPromptsProps extends Omit<
  HTMLMotionProps<"div">,
  "children"
> {
  /** The `SuggestedPrompt` rows. */
  children: React.ReactNode
  /** Overrides the count derived from `children`. */
  count?: number
  /** Names the disclosure. `Suggestions (n)` by default. */
  label?: (count: number) => React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** Children.toArray, but looking through fragments so `<>{a}{b}</>` counts two. */
function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: React.ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child]
  )
}

/**
 * The "Suggestions (n)" disclosure above the composer: a chevron that swings
 * from left (folded) to down (open) and a panel of prompts that fans out
 * beneath it, its bottom edge tucked behind the composer pill.
 */
export function SuggestedPrompts({
  children,
  count,
  label = (n) => `Suggestions (${n})`,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  ...props
}: SuggestedPromptsProps): React.ReactElement | null {
  const panelId = useId()
  const reduceMotion = useReducedMotion()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = openProp ?? internalOpen
  const items = flattenChildren(children)

  const setOpen = (next: boolean): void => {
    if (openProp === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  // Picking the last prompt empties `children`. Collapsing the whole block on
  // height rather than returning null keeps the header from blinking out in a
  // single frame while that last row is still flying to its bubble.
  return (
    <motion.div
      animate={{ height: items.length ? "auto" : 0, opacity: items.length ? 1 : 0 }}
      className={cn("flex flex-col overflow-hidden", className)}
      data-slot="suggested-prompts"
      initial={false}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE_IN_OUT }
      }
      {...props}
    >
      <motion.button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-1 text-sm text-muted-foreground outline-none transition-colors duration-150 ease-smooth-out hover:text-foreground focus-visible:text-foreground"
        data-slot="suggested-prompts-trigger"
        onClick={() => setOpen(!open)}
        type="button"
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <Sparkle aria-hidden="true" className="size-4 stroke-[1.5]" />
        <span className="flex-1 text-left">{label(count ?? items.length)}</span>
        <motion.span
          animate={{ rotate: open ? 0 : 90 }}
          className="inline-flex"
          initial={false}
          transition={reduceMotion ? { duration: 0 } : SPRING_PANEL}
        >
          <ChevronDown aria-hidden="true" className="size-4 stroke-2" />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            // A plain height tween, deliberately not a `layout` projection —
            // the composer shell below animates its own scale, and a second
            // projection over the same box breaks its scale correction.
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.32, ease: EASE_IN_OUT }
            }
          >
            <motion.div
              animate="visible"
              // The bottom padding is what the composer pill sits over, so the
              // panel reads as tucked behind it rather than stacked on it.
              className="-mb-5 mt-1 flex flex-col gap-0.5 rounded-2xl bg-(--chat-field) p-1.5 pb-6"
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
    </motion.div>
  )
}
