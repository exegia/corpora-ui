"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardFrame, CardFrameHeader, CardPanel } from "@/components/ui/card"
import { SPRING_SWAP } from "@/lib/ease"
import { DOT_TONE_CLASSES, Dot, FollowUpRow, IconButton, Pill, Stat, type DotTone, type StatProps } from "@/components/ui/chat"
import { Chart, type ChartDatum, type ChartSeries } from "./chart"

export interface Insight {
  /** Sentence; `entity` is highlighted with a dot in front. */
  summary: React.ReactNode
  stats?: StatProps[]
  snapshot?: { label?: React.ReactNode; badge?: React.ReactNode; data: ChartDatum[]; series: ChartSeries[] }
  /** Share breakdown: tile + big value, a segmented bar, selectable legend pills and a detail panel. */
  allocation?: InsightAllocation
  followUp?: string
}

export interface InsightSegment {
  key: string
  label: React.ReactNode
  value: number
  tone?: DotTone
  /** Detail panel heading; falls back to `label`. */
  title?: React.ReactNode
  description?: React.ReactNode
}

export interface InsightAllocation {
  label: React.ReactNode
  value: React.ReactNode
  /** Letter in the tile; takes the first segment's tone. */
  initials?: string
  segments: InsightSegment[]
  defaultSelected?: string
}

const TONE_TEXT: Record<DotTone, string> = {
  success: "text-semantic-success", warning: "text-semantic-warning", info: "text-semantic-info", danger: "text-semantic-danger",
  neutral: "text-text-muted", accent: "text-accent-default", brand: "text-brand",
  "series-1": "text-chart-series-1", "series-2": "text-chart-series-2", "series-3": "text-chart-series-3", "series-4": "text-chart-series-4", "series-5": "text-chart-series-5",
}

const pct = (n: number, total: number) => `${Math.round((n / total) * 1000) / 10}%`

/** @sketch beautiful-ui "Insight Cards / allocation" — segment selection changes the inspected group without moving the card. */
function Allocation({ label, value, initials, segments, defaultSelected }: InsightAllocation): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const [selected, setSelected] = React.useState(defaultSelected ?? segments[0]?.key)
  const total = segments.reduce((n, s) => n + s.value, 0) || 1
  const active = segments.find((s) => s.key === selected) ?? segments[0]
  const tone = (s?: InsightSegment) => s?.tone ?? "series-1"

  return (
    <CardPanel data-slot="insight-allocation" className="flex flex-col gap-3 p-3">
      <span className="flex items-center gap-2 text-[12.5px] text-text-secondary">
        <span className={cn("inline-flex size-5 items-center justify-center rounded-full text-[9px] font-semibold text-white", DOT_TONE_CLASSES[tone(segments[0])])}>
          {initials ?? String(label).slice(0, 1).toUpperCase()}
        </span>
        {label}
      </span>
      <span className="text-[26px] font-semibold leading-8 tracking-tight text-text-primary">{value}</span>
      <div className="flex h-6 gap-1" role="group" aria-label="Share by segment">
        {segments.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-label={typeof s.label === "string" ? s.label : undefined}
            aria-pressed={s.key === active?.key}
            onClick={() => setSelected(s.key)}
            style={{ flexGrow: s.value }}
            className={cn(
              "min-w-1.5 rounded-full outline-none transition-[opacity,box-shadow] duration-300 ease-[var(--ease-out-strong)] focus-visible:ring-2 focus-visible:ring-ring",
              s.key === active?.key ? cn("ring-2 ring-inset ring-white/25", DOT_TONE_CLASSES[tone(s)]) : "bg-surface-subtle hover:opacity-80"
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {segments.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={s.key === active?.key}
            onClick={() => setSelected(s.key)}
            className={cn(
              "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              s.key === active?.key ? "bg-surface-subtle text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Dot tone={s.key === active?.key ? tone(s) : "neutral"} />
            {s.label} {pct(s.value, total)}
          </button>
        ))}
      </div>
      {active ? (
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={active.key}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={reduceMotion ? { duration: 0 } : SPRING_SWAP}
            className="flex flex-col gap-1 rounded-md bg-surface-subtle px-3 py-2.5"
          >
            <span className={cn("text-[12px] font-semibold leading-4", TONE_TEXT[tone(active)])}>{active.title ?? active.label}</span>
            {active.description ? <span className="text-[12px] leading-4 text-text-secondary">{active.description}</span> : null}
          </motion.div>
        </AnimatePresence>
      ) : null}
    </CardPanel>
  )
}

export interface InsightCardsProps extends React.ComponentPropsWithoutRef<"div"> {
  header?: React.ReactNode
  insights: Insight[]
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  onFollowUp?: (text: string) => void
}

/**
 * Paged insights: header with count and prev/next, summary, stats,
 * a trend snapshot (line plot + legend) or an allocation breakdown, and a follow-up prompt.
 *
 * @sketch "Component / Insight Cards"
 */
export function InsightCards({ header = "Insights", insights, index, defaultIndex = 0, onIndexChange, onFollowUp, className, ...props }: InsightCardsProps): React.ReactElement {
  const reduceMotion = useReducedMotion()
  const [internal, setInternal] = React.useState(defaultIndex)
  const current = Math.min(index ?? internal, Math.max(insights.length - 1, 0))
  // Which way the card slides: next pulls the new one up from below, previous from above.
  const [direction, setDirection] = React.useState(1)
  const go = (next: number) => {
    setDirection(next > current ? 1 : -1)
    if (index === undefined) setInternal(next)
    onIndexChange?.(next)
  }
  const insight = insights[current]
  const offset = reduceMotion ? 0 : 24 * direction

  return (
    <div data-slot="insight-cards" className={cn("flex w-[344px] max-w-full flex-col gap-2.5", className)} {...props}>
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] font-semibold leading-4 text-text-primary">{header}</span>
        <span className="text-[13px] text-text-muted">{insights.length}</span>
        <span className="ml-auto flex items-center gap-0.5">
          <IconButton aria-label="Previous insight" disabled={current <= 0} onClick={() => go(current - 1)}><ChevronUp /></IconButton>
          <IconButton aria-label="Next insight" disabled={current >= insights.length - 1} onClick={() => go(current + 1)}><ChevronDown /></IconButton>
        </span>
      </div>
      <AnimatePresence custom={direction} initial={false} mode="popLayout">
      {insight ? (
        <motion.div
          key={current}
          className="flex flex-col gap-2.5"
          initial={{ opacity: 0, y: offset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -offset }}
          transition={reduceMotion ? { duration: 0 } : SPRING_SWAP}
        >
          <p className="text-[13px] leading-[15px] text-text-secondary [&_[data-slot=dot]]:mx-0.5 [&_[data-slot=dot]]:inline-block [&_[data-slot=dot]]:align-middle">
            {insight.summary}
          </p>
          <CardFrame className="[--frame-radius:var(--radius-md)]">
            {insight.stats?.length ? (
              <CardFrameHeader className="flex flex-row gap-4 p-4">
                {insight.stats.map((s, i) => <Stat key={i} {...s} />)}
              </CardFrameHeader>
            ) : null}
            {insight.allocation ? <Card><Allocation {...insight.allocation} /></Card> : null}
            {insight.snapshot ? (
              <Card><CardPanel className="flex flex-col gap-2 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] leading-3 text-text-secondary">{insight.snapshot.label ?? "Trend snapshot"}</span>
                  <Pill>{insight.snapshot.badge ?? "Snapshot"}</Pill>
                </div>
                <Chart type="line" headerless plotHeight={110} data={insight.snapshot.data} series={insight.snapshot.series} className="w-full" />
              </CardPanel></Card>
            ) : null}
          </CardFrame>
          {insight.followUp ? <FollowUpRow onSelect={() => onFollowUp?.(insight.followUp!)} className="w-fit rounded-full border border-border-default bg-surface-card px-3 hover:bg-surface-subtle">{insight.followUp}</FollowUpRow> : null}
        </motion.div>
      ) : null}
      </AnimatePresence>
    </div>
  )
}

/** Inline entity marker for `Insight.summary`: dot + name. */
export function InsightEntity({ tone = "neutral", children }: { tone?: DotTone; children: React.ReactNode }): React.ReactElement {
  return <><Dot tone={tone} size={8} /> {children}</>
}

