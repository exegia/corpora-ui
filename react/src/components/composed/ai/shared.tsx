import { Children, Fragment, isValidElement } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { EASE_IN_OUT, SPRING_PANEL } from "@/lib/ease"
import type { Variants } from "motion"

// The AI accent is a muted amber used sparingly — the ✦ icon, small labels
// and the primary Apply action. Everything else reads from theme tokens so
// these components inherit whatever surface hosts them (e.g. the shell
// right panel).
export const accentText = "text-amber-600 dark:text-amber-300/90"

export const accentRing = "ring-offset-0 focus-visible:ring-amber-400/40"

export const accentSolid = cn(
  "border-amber-500/60 bg-amber-400/90 text-amber-950 shadow-none hover:bg-amber-400 disabled:opacity-35 data-pressed:bg-amber-400 *:data-[slot=button-loading-indicator]:text-amber-950",
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

/** The AI spark — the accent-coloured ✦ that marks every AI affordance. */
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

export function CloseIcon(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

// Frosted card used by suggestion cards: a translucent field with a lit top
// edge and a light backdrop blur so the thread reads through it.
export const glassCard =
  "rounded-md border-0 border-t-2 border-t-white/70 bg-neutral-200/45 shadow-none backdrop-blur-[3px] backdrop-saturate-125 before:hidden dark:border-t-neutral-700 dark:bg-neutral-800/50"

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

/** Children.toArray, but looking through fragments so `<>{a}{b}</>` counts two. */
export function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: React.ReactNode }>(child) &&
    child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child]
  )
}
