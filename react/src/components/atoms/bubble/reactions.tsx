"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease"
import { useBubbleVariant } from "./context"
import type { BubbleReactionsProps, BubbleReactionChipProps } from "./types"
import { reactionKey } from "./utils"
import { GlassContainer } from "@/components/ui/glasscn/glass-container"

/**
 * One emoji + count inside the pill. Pressing it springs the emoji, and a
 * count change slides the old number out as the new one drops in.
 */
export function BubbleReactionChip({
  reaction,
  index,
  onToggle,
  className,
  ...props
}: BubbleReactionChipProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const showCount = reaction.count != null && reaction.count > 0

  return (
    <motion.button
      aria-label={reaction.label}
      aria-pressed={reaction.reacted ?? false}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-lg px-1 py-0.5 text-sm leading-4 font-bold text-neutral-600 transition-colors duration-150 ease-smooth-out outline-none hover:bg-black/6 focus-visible:ring-2 focus-visible:ring-ring dark:text-neutral-300 dark:hover:bg-white/8",
        reaction.reacted && "text-foreground",
        className
      )}
      data-reacted={reaction.reacted ? "" : undefined}
      data-slot="bubble-reaction"
      onClick={() => onToggle?.(reaction, index)}
      transition={SPRING_PRESS}
      type="button"
      whileTap={reduceMotion ? undefined : { scale: 0.88 }}
      {...props}
    >
      <motion.span
        animate={
          reduceMotion
            ? { scale: 1 }
            : { scale: reaction.reacted ? [1, 1.35, 1] : 1 }
        }
        aria-hidden={reaction.label ? true : undefined}
        className="inline-block text-[11px] leading-4"
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.36, ease: EASE_IN_OUT, times: [0, 0.45, 1] }
        }
      >
        {reaction.emoji}
      </motion.span>
      {showCount ? (
        <span className="relative inline-grid overflow-hidden tabular-nums">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              animate={{ y: 0, opacity: 1 }}
              className="[grid-area:1/1]"
              exit={{ y: reduceMotion ? 0 : -10, opacity: 0 }}
              initial={{ y: reduceMotion ? 0 : 10, opacity: 0 }}
              key={reaction.count}
              transition={reduceMotion ? { duration: 0 } : SPRING_SWAP}
            >
              {reaction.count}
            </motion.span>
          </AnimatePresence>
        </span>
      ) : null}
    </motion.button>
  )
}

/**
 * Glass reaction pill that hangs off the bubble's bottom trailing corner.
 * Pass `reactions` for the standard chips, or children for a custom row —
 * both share the pill.
 */
export function BubbleReactions({
  reactions = [],
  onToggle,
  className,
  children,
  ...props
}: BubbleReactionsProps): React.ReactElement {
  const variant = useBubbleVariant()
  return (
    <div
      className={cn(
        "absolute -bottom-5 z-[1] flex h-8 w-fit flex-1",
        variant === "sender" ? "left-4" : "right-4 justify-items-end",
        className
      )}
    >
      <GlassContainer
        glassVariant="liquid-refract"
        refraction={3}
        bezel={12}
        saturation={2}
        className={cn(
          "inline-flex h-full w-fit items-center rounded-xl",
          className
        )}
        data-slot="bubble-reactions"
        {...props}
      >
        <div className={cn("mx-1.5", reactions.length === 0 ? "hidden" : undefined)}>
          {reactions.map((reaction, index) => (
            <BubbleReactionChip
              index={index}
              key={reactionKey(reaction, index)}
              onToggle={onToggle}
              reaction={reaction}
            />
          ))}
          {children}
        </div>
      </GlassContainer>
    </div>
  )
}
