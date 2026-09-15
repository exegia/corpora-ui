import { CornerDownLeft } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Favicon } from "./badges"
import { Dot, type DotTone } from "./dot"

export interface SourceChipProps extends React.ComponentPropsWithoutRef<"span"> {
  favicon?: string
  /** Domain in mono ("scoopdata.io"). */
  children: React.ReactNode
}

/**
 * 18px pill with a favicon and a mono domain, inline in streamed text.
 *
 * @sketch "Atom / Source Chip"
 */
export function SourceChip({ favicon, className, children, ...props }: SourceChipProps): React.ReactElement {
  return (
    <span
      data-slot="source-chip"
      className={cn("inline-flex h-[18px] items-center gap-1.5 rounded-full bg-surface-subtle py-0.5 pl-0.5 pr-2 align-middle font-mono text-[10.5px] leading-none text-text-secondary", className)}
      {...props}
    >
      <Favicon src={favicon} size={14} />
      {children}
    </span>
  )
}

export interface AvatarStackProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Up to three tones or image urls, rendered overlapping. */
  items?: (DotTone | { src: string })[]
}

/**
 * Three overlapping 14px circles.
 *
 * @sketch "Atom / Avatar Stack"
 */
export function AvatarStack({ items = ["series-1", "series-3", "series-4"], className, ...props }: AvatarStackProps): React.ReactElement {
  return (
    <span aria-hidden="true" data-slot="avatar-stack" className={cn("inline-flex items-center", className)} {...props}>
      {items.slice(0, 3).map((item, i) => (
        <span key={i} className={cn("inline-flex size-3.5 overflow-hidden rounded-full ring-2 ring-surface-card", i > 0 && "-ml-1.5")}>
          {typeof item === "string" ? <Dot tone={item} className="size-full rounded-full" /> : <img alt="" className="size-full object-cover" src={item.src} />}
        </span>
      ))}
    </span>
  )
}

export interface StatProps extends React.ComponentPropsWithoutRef<"div"> {
  tone?: DotTone
  label: React.ReactNode
  value: React.ReactNode
  /** Secondary mono line ("−$2,377.66"). */
  delta?: React.ReactNode
  trend?: "positive" | "negative"
}

/**
 * 152×64 stat: dot + label, big coloured value, mono delta.
 *
 * @sketch "Atom / Stat / {Positive, Negative}"
 */
export function Stat({ tone = "series-1", label, value, delta, trend = "positive", className, ...props }: StatProps): React.ReactElement {
  const color = trend === "positive" ? "text-semantic-success" : "text-semantic-danger"
  return (
    <div data-slot="stat" data-trend={trend} className={cn("flex w-[152px] flex-col gap-1", className)} {...props}>
      <span className="flex items-center gap-2 text-[11px] leading-none text-text-secondary">
        <Dot tone={tone} />
        <span className="truncate">{label}</span>
      </span>
      <span className={cn("text-[17px] font-semibold leading-5", color)}>{value}</span>
      {delta !== undefined ? <span className={cn("font-mono text-[11px] leading-none", color)}>{delta}</span> : null}
    </div>
  )
}

export interface FollowUpRowProps extends Omit<React.ComponentPropsWithoutRef<"button">, "onSelect"> {
  onSelect?: () => void
}

/**
 * Full-width follow-up prompt with a return-arrow icon and a hairline base.
 *
 * @sketch "Atom / Follow-up Row"
 */
export function FollowUpRow({ onSelect, className, children, ...props }: FollowUpRowProps): React.ReactElement {
  return (
    <button
      type="button"
      data-slot="follow-up-row"
      onClick={onSelect}
      className={cn(
        "flex h-8 w-full items-center gap-2.5 border-b border-border-default px-1 text-left text-[12.5px] leading-none text-text-primary outline-none transition-colors hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-text-muted",
        className
      )}
      {...props}
    >
      <CornerDownLeft />
      <span className="truncate">{children}</span>
    </button>
  )
}
