"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Dot, FollowUpRow, IconButton, Pill, Stat, type DotTone, type StatProps } from "@/components/ui/chat"
import { Chart, type ChartDatum, type ChartSeries } from "./chart"

export interface Insight {
  /** Sentence; `entity` is highlighted with a dot in front. */
  summary: React.ReactNode
  stats: [StatProps, StatProps] | StatProps[]
  snapshot?: { label?: React.ReactNode; badge?: React.ReactNode; data: ChartDatum[]; series: ChartSeries[] }
  followUp?: string
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
 * Paged insights: header with count and prev/next, summary, two stats,
 * a trend snapshot (line plot + legend) and a follow-up prompt.
 *
 * @sketch "Component / Insight Cards"
 */
export function InsightCards({ header = "Insights", insights, index, defaultIndex = 0, onIndexChange, onFollowUp, className, ...props }: InsightCardsProps): React.ReactElement {
  const [internal, setInternal] = React.useState(defaultIndex)
  const current = Math.min(index ?? internal, Math.max(insights.length - 1, 0))
  const go = (next: number) => {
    if (index === undefined) setInternal(next)
    onIndexChange?.(next)
  }
  const insight = insights[current]

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
      {insight ? (
        <>
          <p className="text-[13px] leading-[15px] text-text-secondary [&_[data-slot=dot]]:mx-0.5 [&_[data-slot=dot]]:inline-block [&_[data-slot=dot]]:align-middle">
            {insight.summary}
          </p>
          <div className="flex flex-col gap-3 rounded-xl border border-border-default bg-surface-card p-3">
            <div className="flex gap-4">
              {insight.stats.map((s, i) => <Stat key={i} {...s} />)}
            </div>
            {insight.snapshot ? (
              <div className="flex flex-col gap-2 rounded-[10px] bg-surface-subtle p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] leading-3 text-text-secondary">{insight.snapshot.label ?? "Trend snapshot"}</span>
                  <Pill>{insight.snapshot.badge ?? "Snapshot"}</Pill>
                </div>
                <Chart type="line" headerless plotHeight={110} data={insight.snapshot.data} series={insight.snapshot.series} className="w-full border-0 bg-transparent p-0" />
              </div>
            ) : null}
          </div>
          {insight.followUp ? <FollowUpRow onSelect={() => onFollowUp?.(insight.followUp!)} className="w-fit rounded-full border border-border-default bg-surface-card px-3 hover:bg-surface-subtle">{insight.followUp}</FollowUpRow> : null}
        </>
      ) : null}
    </div>
  )
}

/** Inline entity marker for `Insight.summary`: dot + name. */
export function InsightEntity({ tone = "neutral", children }: { tone?: DotTone; children: React.ReactNode }): React.ReactElement {
  return <><Dot tone={tone} size={8} /> {children}</>
}

