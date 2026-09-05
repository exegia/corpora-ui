import type * as React from "react"
import { cn } from "@/lib/utils"

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
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-black/10 bg-black/5 px-1 font-sans text-[10px] leading-none text-muted-foreground shadow-[inset_0_-1px_0_rgb(0_0_0/0.08)] dark:border-white/10 dark:bg-white/6 dark:shadow-[inset_0_-1px_0_rgb(0_0_0/0.4)]",
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
  /** Drop the trailing "to send message" when space is tight. */
  verbose?: boolean
}): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm whitespace-nowrap text-muted-foreground/60",
        className
      )}
      data-slot="send-hint"
    >
      Press <Kbd aria-label="Command">⌘</Kbd>
      <span aria-hidden="true">+</span>
      <Kbd aria-label="Enter">↵</Kbd>
      {verbose ? <span>to send message</span> : null}
    </span>
  )
}
