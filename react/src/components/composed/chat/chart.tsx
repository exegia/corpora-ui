"use client"

import { useReducedMotion } from "motion/react"
import type * as React from "react"
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { Dot, LegendItem, Pill, type DotTone } from "@/components/ui/chat"

export type ChartType = "pie" | "area" | "line" | "bar"

export interface ChartSeries {
  /** Key into each data row. */
  key: string
  label: React.ReactNode
  /** Defaults to `var(--chart-series-N)` by position. */
  color?: string
  /** Renders a value in the legend and tooltip (`v => \`${v}%\``). */
  format?: (value: number) => React.ReactNode
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

const fmt = (s: ChartSeries | undefined, v: unknown): React.ReactNode =>
  typeof v === "number" && s?.format ? s.format(v) : String(v)

interface TooltipRow { name?: unknown; value?: unknown; color?: string; payload?: ChartDatum }

/** Hover card: category label, then one dot · series · value row per series. */
function ChartTooltip({ active, payload, label, series }: { active?: boolean; payload?: TooltipRow[]; label?: unknown; series: ChartSeries[] }): React.ReactElement | null {
  if (!active || !payload?.length) return null
  // Pie rows already carry the category as their name, so no heading there.
  const heading = series.length > 1 || label !== undefined ? (label ?? payload[0].payload?.label) : undefined
  return (
    <div data-slot="chart-tooltip" className="min-w-28 rounded-lg border border-border-default bg-surface-card px-2.5 py-2 shadow-md">
      {heading !== undefined ? <div className="mb-1.5 text-[11px] font-medium leading-3 text-text-secondary">{String(heading)}</div> : null}
      <ul className="flex flex-col gap-1">
        {payload.map((row, i) => {
          const si = Math.max(0, series.findIndex((s) => s.key === row.name))
          const s = series[si]
          return (
            <li key={i} className="flex items-center gap-2 text-[11px] leading-3">
              <Dot tone={seriesTone(series.length > 1 ? si : i)} />
              <span className="truncate text-text-secondary">{series.length > 1 ? s?.label : (row.payload?.label ?? s?.label)}</span>
              <span className="ml-auto pl-3 font-medium text-text-primary">{fmt(s, row.value)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

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
  const reduceMotion = useReducedMotion()
  const anim = { isAnimationActive: !reduceMotion, animationDuration: 700, animationEasing: "ease-out" as const }
  const tooltip = <Tooltip content={<ChartTooltip series={series} />} cursor={{ stroke: "var(--chart-grid)", fill: "var(--chart-grid)", fillOpacity: 0.4 }} isAnimationActive={!reduceMotion} animationDuration={150} />

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
                  {tooltip}
                  <Pie data={data} dataKey={series[0].key} nameKey="label" innerRadius="66%" outerRadius="100%" paddingAngle={2} stroke="none" {...anim}>
                    {data.map((_, i) => <Cell key={i} fill={`var(--chart-series-${(i % 5) + 1})`} className="transition-opacity duration-200 hover:opacity-80" />)}
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
                  <LegendItem tone={seriesTone(i)} value={fmt(series[0], d[series[0].key])} className="w-full">{d.label}</LegendItem>
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
                    {tooltip}
                    {series.map((s, i) => <Bar key={s.key} dataKey={s.key} fill={seriesColor(s, i)} radius={[4, 4, 0, 0]} {...anim} />)}
                  </BarChart>
                ) : type === "line" ? (
                  <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis {...AXIS} />
                    {tooltip}
                    {series.map((s, i) => (
                      <Line key={s.key} type="monotone" dataKey={s.key} stroke={seriesColor(s, i)} strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: "var(--surface-card)" }} activeDot={{ r: 5, strokeWidth: 0 }} {...anim} />
                    ))}
                  </LineChart>
                ) : (
                  <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis {...AXIS} />
                    {tooltip}
                    {series.map((s, i) => (
                      <Area key={s.key} type="monotone" dataKey={s.key} stroke={seriesColor(s, i)} strokeWidth={2} fill={i === 0 ? "var(--chart-area-fill)" : seriesColor(s, i)} fillOpacity={1} activeDot={{ r: 5, strokeWidth: 0 }} {...anim} />
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
