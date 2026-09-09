"use client"

import type * as React from "react"
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { LegendItem, Pill, type DotTone } from "@/components/ui/chat"

export type ChartType = "pie" | "area" | "line" | "bar"

export interface ChartSeries {
  /** Key into each data row. */
  key: string
  label: React.ReactNode
  /** Defaults to `var(--chart-series-N)` by position. */
  color?: string
}

export type ChartDatum = { label: string; [key: string]: string | number }

export interface ChartProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  type: ChartType
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Pill text; defaults to the capitalised type. */
  badge?: React.ReactNode
  data: ChartDatum[]
  /** Series to plot; pie uses the first one. */
  series: ChartSeries[]
  /** Pie only: big number and caption in the donut's centre. */
  center?: { value: React.ReactNode; label?: React.ReactNode }
  /** Drop the title row (InsightCards embeds a bare plot). */
  headerless?: boolean
  /** Plot height in px; the card is 244 tall with the header. */
  plotHeight?: number
}

const TYPE_LABEL: Record<ChartType, string> = { pie: "Pie", area: "Area", line: "Line", bar: "Bar" }

const seriesColor = (s: ChartSeries, i: number) => s.color ?? `var(--chart-series-${(i % 5) + 1})`
const seriesTone = (i: number) => `series-${(i % 5) + 1}` as DotTone

const AXIS = { tick: { fontSize: 11, fill: "var(--text-secondary)" }, axisLine: false, tickLine: false, dataKey: "label", interval: 0 as const }

/**
 * 320×244 chart card: title, subtitle, type pill, plot, x labels, legend.
 * Series colours are the `--chart-series-*` tokens, grid is `--chart-grid`.
 *
 * @sketch "Component / Chart / {Pie, Area, Line, Bar}"
 */
export function Chart({
  type, title, subtitle, badge, data, series, center, headerless = false, plotHeight, className, ...props
}: ChartProps): React.ReactElement {
  const height = plotHeight ?? (type === "pie" ? 140 : 150)
  const empty = data.length === 0 || series.length === 0

  return (
    <div
      data-slot="chart"
      data-type={type}
      className={cn("flex w-80 max-w-full flex-col rounded-xl border border-border-default bg-surface-card p-3.5", headerless ? "gap-2" : "gap-3", className)}
      {...props}
    >
      {headerless ? null : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[13px] font-semibold leading-4 text-text-primary">{title}</span>
            {subtitle ? <span className="truncate text-[11px] leading-3 text-text-secondary">{subtitle}</span> : null}
          </div>
          <Pill>{badge ?? TYPE_LABEL[type]}</Pill>
        </div>
      )}

      {type === "pie" ? (
        <div className="flex items-center gap-6">
          <div className="relative shrink-0" style={{ width: height, height }}>
            {empty ? null : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey={series[0].key} nameKey="label" innerRadius="66%" outerRadius="100%" paddingAngle={2} stroke="none" isAnimationActive={false}>
                    {data.map((_, i) => <Cell key={i} fill={`var(--chart-series-${(i % 5) + 1})`} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            {center ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[17px] font-semibold leading-5 text-text-primary">{center.value}</span>
                {center.label ? <span className="text-[11px] leading-3 text-text-secondary">{center.label}</span> : null}
              </div>
            ) : null}
          </div>
          {empty ? null : (
            <ul className="flex min-w-0 flex-1 flex-col gap-3.5">
              {data.map((d, i) => (
                <li key={d.label} className="flex">
                  <LegendItem tone={seriesTone(i)} value={String(d[series[0].key])} className="w-full">{d.label}</LegendItem>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div style={{ height }} className="w-full">
            {empty ? null : (
              <ResponsiveContainer width="100%" height="100%">
                {type === "bar" ? (
                  <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barCategoryGap="30%">
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis {...AXIS} />
                    {series.map((s, i) => <Bar key={s.key} dataKey={s.key} fill={seriesColor(s, i)} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
                  </BarChart>
                ) : type === "line" ? (
                  <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis {...AXIS} />
                    {series.map((s, i) => (
                      <Line key={s.key} type="monotone" dataKey={s.key} stroke={seriesColor(s, i)} strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: "var(--surface-card)" }} isAnimationActive={false} />
                    ))}
                  </LineChart>
                ) : (
                  <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis {...AXIS} />
                    {series.map((s, i) => (
                      <Area key={s.key} type="monotone" dataKey={s.key} stroke={seriesColor(s, i)} strokeWidth={2} fill={i === 0 ? "var(--chart-area-fill)" : seriesColor(s, i)} fillOpacity={1} isAnimationActive={false} />
                    ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
          {empty ? null : (
            <div className="flex flex-wrap gap-4">
              {series.map((s, i) => <LegendItem key={s.key} tone={seriesTone(i)}>{s.label}</LegendItem>)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
