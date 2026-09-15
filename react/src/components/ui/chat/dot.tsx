import type * as React from "react"
import { cn } from "@/lib/utils"

export type DotTone =
  | "success" | "warning" | "info" | "danger" | "neutral" | "accent" | "brand"
  | "series-1" | "series-2" | "series-3" | "series-4" | "series-5"

export const DOT_TONE_CLASSES: Record<DotTone, string> = {
  success: "bg-semantic-success",
  warning: "bg-semantic-warning",
  info: "bg-semantic-info",
  danger: "bg-semantic-danger",
  neutral: "bg-text-muted",
  accent: "bg-accent-default",
  brand: "bg-brand",
  "series-1": "bg-chart-series-1",
  "series-2": "bg-chart-series-2",
  "series-3": "bg-chart-series-3",
  "series-4": "bg-chart-series-4",
  "series-5": "bg-chart-series-5",
}

export interface DotProps extends React.ComponentPropsWithoutRef<"span"> {
  tone?: DotTone
  size?: 6 | 8
}

/**
 * Status / series marker.
 *
 * @sketch "Atom / Dot / {Success, Warning, Info, Danger, Neutral, Accent, Brand, Series 3, Series 4}"
 */
export function Dot({ tone = "neutral", size = 8, className, ...props }: DotProps): React.ReactElement {
  return (
    <span
      aria-hidden="true"
      data-slot="dot"
      data-tone={tone}
      className={cn("inline-block shrink-0 rounded-full", size === 8 ? "size-2" : "size-1.5", DOT_TONE_CLASSES[tone], className)}
      {...props}
    />
  )
}

export interface LegendItemProps extends React.ComponentPropsWithoutRef<"span"> {
  tone?: DotTone
  /** Optional trailing value ("42%"). */
  value?: React.ReactNode
}

/**
 * Dot + label (+ value) row for chart legends.
 *
 * @sketch "Atom / Legend Item"
 */
export function LegendItem({ tone = "series-1", value, className, children, ...props }: LegendItemProps): React.ReactElement {
  return (
    <span data-slot="legend-item" className={cn("inline-flex h-4 items-center gap-2 text-[11px] leading-none text-text-secondary", className)} {...props}>
      <Dot tone={tone} />
      <span className="truncate">{children}</span>
      {value !== undefined ? <span className="ml-auto pl-3 font-medium text-text-primary">{value}</span> : null}
    </span>
  )
}

/**
 * 20px neutral pill for chart-type badges and counts.
 *
 * @sketch "Atom / Pill"
 */
export function Pill({ className, children, ...props }: React.ComponentPropsWithoutRef<"span">): React.ReactElement {
  return (
    <span
      data-slot="pill"
      className={cn("inline-flex h-5 shrink-0 items-center rounded-full bg-surface-subtle px-2.5 text-[11px] font-medium leading-none text-text-secondary", className)}
      {...props}
    >
      {children}
    </span>
  )
}
