"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease"
import { useBubbleVariant } from "./context"
import type { BubbleReactionsProps, BubbleReactionChipProps, BubbleReactionsButtonProps } from "./types"
import { reactionKey } from "./utils"
import { GlassContainer } from "@/components/ui/glasscn/glass-container"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover-popup"
import { EmojiActionBar } from "./emoji-action-bar"
import { useState } from "react"
import { FaceSlightlySmilingPlus } from "lucide-react";

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
        "inline-flex cursor-pointer items-center gap-1 rounded-lg px-1 py-2 font-bold text-neutral-600 transition-colors duration-150 ease-smooth-out outline-none hover:bg-black/6 focus-visible:ring-0 focus-visible:ring-ring dark:text-neutral-300 dark:hover:bg-white/8",
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
        className="block text-xs select-none"
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
              className="[grid-area:1/1] text-xs select-none"
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

export function BubbleReactionsButton({
  className,
  onClick,
  onEmojiSelect,
  ...props
}: BubbleReactionsButtonProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <motion.button
            aria-label="Add reaction"
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-lg px-1 py-2 font-bold text-neutral-600 transition-colors duration-150 ease-smooth-out outline-none hover:bg-black/6 focus-visible:ring-0 focus-visible:ring-ring dark:text-neutral-300 dark:hover:bg-white/8",
              className
            )}
            data-slot="bubble-reaction-button"
            onClick={onClick}
            transition={SPRING_PRESS}
            type="button"
            whileTap={reduceMotion ? undefined : { scale: 0.88 }}
            {...props}
          />
        }
      >
        <motion.span
          animate={reduceMotion ? { scale: 1 } : { scale: open ? [1, 1.35, 1] : 1 }}
          className="block text-xs select-none"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.36, ease: EASE_IN_OUT, times: [0, 0.8, 1] }
          }
        >
          <FaceSlightlySmilingPlus size={16} />
        </motion.span>
      </PopoverTrigger>
      <PopoverPopup
        align="end"
        // Opens as the compact quick-reaction bar and grows to the full picker
        // when "More" is pressed — that swap is a genuine popup resize, which is
        // why the viewport variable below has to be zeroed, not just the padding.
        // The viewport sizes its transitioning child with
        // calc(--popup-width - 2*--viewport-inline-padding - 2px), so zeroing the
        // variable (not just the padding) is what keeps the picker from being
        // squeezed by 2x16px while Base UI holds --popup-width at a concrete px.
        // The picker paints its own bg-popover on the root and on each sticky
        // category header; both have to come off for the glass to show, and the
        // headers get a tint of their own so emoji still pass behind them.
        className="w-fit [&_[data-slot=emoji-picker-category-header]]:bg-white/65 [&_[data-slot=emoji-picker-category-header]]:backdrop-blur-sm [&_[data-slot=emoji-picker]]:bg-transparent [&_[data-slot=popover-viewport]]:[--viewport-inline-padding:0px] [&_[data-slot=popover-viewport]]:max-h-none [&_[data-slot=popover-viewport]]:overflow-clip [&_[data-slot=popover-viewport]]:py-0 dark:[&_[data-slot=emoji-picker-category-header]]:bg-black/55"
        glassVariant="frosted"
        side="top"
        variant="glass"
      >
        <EmojiActionBar
          onEmojiSelect={(picked) => {
            onEmojiSelect?.(picked)
            setOpen(false)
          }}
        />
      </PopoverPopup>
    </Popover>
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
  onEmojiSelect,
  className,
  children,
  ...props
}: BubbleReactionsProps): React.ReactElement {
  const variant = useBubbleVariant()
  return (
    <div
      className={cn(
        "absolute -bottom-5 z-[1] flex max-h-8 w-fit flex-1 items-center",
        variant === "sender" ? "left-4" : "right-4",
        className
      )}
    >
      <GlassContainer
        glassVariant="frosted"
        refraction={3}
        bezel={12}
        blur={5}
        saturation={2}
        className={cn(
          "inline-flex h-full w-fit items-center rounded-xl",
          className
        )}
        data-slot="bubble-reactions"
        {...props}
      >
        <div className={cn("mx-1.5 h-full inline-flex items-center")}>
          {reactions.map((reaction, index) => (
            <BubbleReactionChip
              index={index}
              key={reactionKey(reaction, index)}
              onToggle={onToggle}
              reaction={reaction}
            />
          ))}
          <BubbleReactionsButton onEmojiSelect={onEmojiSelect} />
          {children}
        </div>
      </GlassContainer>
    </div>
  )
}
