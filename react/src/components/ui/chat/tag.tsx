import type * as React from "react"
import { cn } from "@/lib/utils"

export type TagTone = "amber" | "purple" | "blue" | "green"

const TONE: Record<TagTone, string> = {
  amber: "border-tag-amber-border bg-tag-amber-fill text-tag-amber-text",
  purple: "border-tag-purple-border bg-tag-purple-fill text-tag-purple-text",
  blue: "border-tag-blue-border bg-tag-blue-fill text-tag-blue-text",
  green: "border-tag-green-border bg-tag-green-fill text-tag-green-text",
}

export interface TagProps extends React.ComponentPropsWithoutRef<"span"> {
  tone?: TagTone
}

/**
 * 22px tinted label with a hairline border.
 *
 * @sketch "Atom / Tag / {Amber, Purple, Blue, Green}"
 */
export function Tag({ tone = "blue", className, children, ...props }: TagProps): React.ReactElement {
  return (
    <span
      data-slot="tag"
      data-tone={tone}
      className={cn("inline-flex h-[22px] shrink-0 items-center rounded-lg border px-2 text-[11px] font-medium leading-none", TONE[tone], className)}
      {...props}
    >
      {children}
    </span>
  )
}

export type SignalLevel = "high" | "medium" | "low"

const SIGNAL: Record<SignalLevel, { lit: number; color: string }> = {
  high: { lit: 3, color: "bg-semantic-success" },
  medium: { lit: 2, color: "bg-semantic-warning" },
  low: { lit: 1, color: "bg-text-muted" },
}

export interface SignalProps extends React.ComponentPropsWithoutRef<"span"> {
  level?: SignalLevel
}

/**
 * Three-bar confidence meter.
 *
 * @sketch "Atom / Signal / {High, Medium, Low}"
 */
export function Signal({ level = "high", className, ...props }: SignalProps): React.ReactElement {
  const { lit, color } = SIGNAL[level]
  return (
    <span role="img" aria-label={`${level} signal`} data-slot="signal" data-level={level} className={cn("inline-flex h-2.5 items-end gap-0.5", className)} {...props}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={cn("w-1 rounded-[1px]", i < lit ? color : "bg-surface-subtle", i === 0 ? "h-1.5" : i === 1 ? "h-2" : "h-2.5")} />
      ))}
    </span>
  )
}
