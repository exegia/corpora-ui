import type * as React from "react"
import { cn } from "@/lib/utils"
import { Kbd as KbdKey, KbdGroup } from "@/components/ui/kbd";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_IN_OUT, SPRING_LAYOUT, SPRING_PANEL } from "@/lib/ease";


// The AI accent is a muted amber used sparingly — the ✦ icon, small labels
// and the primary Apply action. Everything else reads from theme tokens so
// these components inherit whatever surface hosts them (e.g. the shell
// right panel).
export const accentText = "text-amber-600 dark:text-amber-300/90"

export const accentRing = "ring-offset-0 focus-visible:ring-amber-400/40"

export const accentSolid = cn(
  "border-amber-500/60 bg-amber-400/90 text-amber-950 shadow-none hover:bg-amber-400 data-pressed:bg-amber-400 disabled:opacity-35 *:data-[slot=button-loading-indicator]:text-amber-950",
  accentRing
)

// The agent's own voice is violet: its badge, the suggestions disclosure and
// the accepted mark on a suggestion card.
export const agentText = "text-violet-600 dark:text-violet-400"

export const ghostMuted = cn(
  "text-muted-foreground hover:text-foreground",
  accentRing
)

export const mutedText = "text-[13px] leading-5 text-muted-foreground"

// Floating surfaces (scope picker list, selection popover) — theme tokens,
// not a hard-coded dark panel.
export const surface = "border bg-popover text-popover-foreground shadow-lg"

// Frosted card used by suggestion cards: a translucent field with a lit top
// edge and a light backdrop blur so the thread reads through it.
export const glassCard =
  "rounded-[15px] border-0 border-t-2 border-t-white/70 bg-neutral-200/45 shadow-none backdrop-blur-[3px] backdrop-saturate-125 before:hidden dark:border-t-neutral-700 dark:bg-neutral-800/50"

export function AiIcon({
  className,
}: {
  className?: string
}): React.ReactElement {
  return (
    <span aria-hidden="true" className={cn(accentText, className)}>
      ✦
    </span>
  )
}

export function ArrowUpIcon(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 12 6-6 6 6M12 18V7" />
    </svg>
  )
}

/** A keycap, for the "Press ⌘ + ↵" hints in the composer. */
export function Kbd({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"kbd">): React.ReactElement {
  return (
    <KbdKey
      className={cn(
        "inline-flex h-[22px] min-w-[18px] items-center justify-center rounded-[5px] border border-black/10 bg-black/5 px-1 font-sans text-[10px] leading-none text-muted-foreground  border-b-black/15 dark:border-b-black/25 border-b-1  dark:bg-white/6 dark:shadow-[inset_0_-1px_0_rgb(0_0_0/0.4)]",
        className
      )}
      {...props}
    />
  )
}


/** "Press ⌘ + ↵ to send message" — the composer's send hint. */
export function SendHint({
  className,
  verbose = true,
}: {
  className?: string
  /** Pin the keycaps to the end and drop the trailing "to send message". */
  verbose?: boolean
}): React.ReactElement {
  const reduceMotion = useReducedMotion()
  // `justify-content` and `display` are discrete — they snap rather than tween.
  // A spacer whose flex-grow rises 0 → 1 buys the start → end shift, and it
  // takes exactly the room the collapsing label gives back, so both halves ride
  // the same spring.
  const transition = reduceMotion ? { duration: 0 } : SPRING_LAYOUT

  return (
    <motion.span
      className={cn(
        "flex items-center gap-1 flex-1 text-sm whitespace-nowrap text-muted-foreground/60",
        className
      )}
      data-slot="send-hint"
    >
      <motion.span
        aria-hidden="true"
        animate={{ flexGrow: verbose ? 1 : 0 }}
        className="-mr-1 block shrink-0 basis-0"
        initial={false}
        transition={transition}
      />
      Press
      <KbdGroup>
        <Kbd aria-label="Command">⌘</Kbd>
        <Kbd aria-label="Enter" className="w-8">↵</Kbd>
      </KbdGroup>
      <motion.span
        animate={{ opacity: verbose ? 0 : 1, width: verbose ? 0 : "auto", x: verbose ? -8 : 0 }}
        className="inline-block shrink-0 overflow-hidden"
        initial={false}
        transition={transition}
      >
        to send message
      </motion.span>
    </motion.span>
  )
}

// The suggestions fan-out: the list holds the stagger, each item springs up
// into place. Shared by `AiMessage`'s disclosure and `SuggestedPrompts`, so
// both fan out with the same rhythm.
export const LIST_VARIANTS: Variants = {
  hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.97,
    transition: { duration: 0.18, ease: EASE_IN_OUT },
  },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_PANEL },
}
