"use client"

import { useReducedMotion } from "motion/react"
import type * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import {
  Card,
  CardFrame,
  CardFrameHeader,
  CardPanel,
} from "@/components/ui/card"
import { Dot, LegendItem, Pill, type TDotTone } from "@/components/ui/chat"
import { Reference } from "@/components/atoms/reference"

export type TChartType = "pie" | "area" | "line" | "bar"

export interface IChartSeries {
  /** Key into each data row. */
  key: string
  label: React.ReactNode
  /** Defaults to `var(--chart-series-N)` by position. */
  color?: string
  /** Renders a value in the legend and tooltip (`v => \`${v}%\``). */
  format?: (value: number) => React.ReactNode
}

export type TChartDatum = { label: string; [key: string]: string | number }

export interface IChartProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  type: TChartType
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Pill text; defaults to the capitalised type. */
  badge?: React.ReactNode
  /** The passage or Strong's entry behind the data. Replaces the type badge. */
  reference?: React.ComponentProps<typeof Reference>
  data: TChartDatum[]
  /** Series to plot; pie uses the first one. */
  series: IChartSeries[]
  /** Pie only: big number and caption in the donut's centre. */
  center?: { value: React.ReactNode; label?: React.ReactNode }
  /** Drop the title row (InsightCards embeds a bare plot). */
  headerless?: boolean
  /** Plot height in px; the card is 244 tall with the header. */
  plotHeight?: number
}

const TYPE_LABEL: Record<TChartType, string> = {
  pie: "Pie",
  area: "Area",
  line: "Line",
  bar: "Bar",
}

const seriesColor = (s: IChartSeries, i: number) =>
  s.color ?? `var(--chart-series-${(i % 5) + 1})`
const seriesTone = (i: number) => `series-${(i % 5) + 1}` as TDotTone

const fmt = (s: IChartSeries | undefined, v: unknown): React.ReactNode =>
  typeof v === "number" && s?.format ? s.format(v) : String(v)

interface ITooltipRow {
  name?: unknown
  value?: unknown
  color?: string
  payload?: TChartDatum
}

/** Hover card: category label, then one dot · series · value row per series. */
function ChartTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean
  payload?: ITooltipRow[]
  label?: unknown
  series: IChartSeries[]
}): React.ReactElement | null {
  if (!active || !payload?.length) return null
  // Pie rows already carry the category as their name, so no heading there.
  const heading =
    series.length > 1 || label !== undefined
      ? (label ?? payload[0].payload?.label)
      : undefined
  return (
    <div
      data-slot="chart-tooltip"
      className="min-w-28 px-2.5 py-2 shadow-md rounded-md border border-border-default bg-surface-card"
    >
      {heading !== undefined ? (
        <div className="mb-1.5 font-medium leading-3 text-[11px] text-text-secondary">
          {String(heading)}
        </div>
      ) : null}
      <ul className="gap-1 flex flex-col">
        {payload.map((row, i) => {
          const si = Math.max(
            0,
            series.findIndex((s) => s.key === row.name)
          )
          const s = series[si]
          return (
            <li
              key={i}
              className="gap-2 leading-3 flex items-center text-[11px]"
            >
              <Dot tone={seriesTone(series.length > 1 ? si : i)} />
              <span className="truncate text-text-secondary">
                {series.length > 1
                  ? s?.label
                  : (row.payload?.label ?? s?.label)}
              </span>
              <span className="pl-3 font-medium ml-auto text-text-primary">
                {fmt(s, row.value)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const AXIS = {
  tick: { fontSize: 11, fill: "var(--text-secondary)" },
  axisLine: false,
  tickLine: false,
  dataKey: "label",
  padding: { left: 12, right: 12 },
  interval: 0 as const,
}

/**
 * Compact chart card: title, subtitle, reference or type pill, plot and legend.
 * Series colours are the `--chart-series-*` tokens, grid is `--chart-grid`.
 *
 * @sketch "Component / Chart / {Pie, Area, Line, Bar}"
 */
export function Chart({
  type,
  title,
  subtitle,
  badge,
  reference,
  data,
  series,
  center,
  headerless = false,
  plotHeight,
  className,
  ...props
}: IChartProps): React.ReactElement {
  const height = plotHeight ?? (type === "pie" ? 140 : 150)
  const empty = data.length === 0 || series.length === 0
  const reduceMotion = useReducedMotion()
  const anim = {
    isAnimationActive: !reduceMotion,
    animationDuration: 700,
    animationEasing: "ease-out" as const,
  }
  const tooltip = (
    <Tooltip
      content={<ChartTooltip series={series} />}
      cursor={{
        stroke: "var(--chart-grid)",
        fill: "var(--chart-grid)",
        fillOpacity: 0.4,
      }}
      isAnimationActive={!reduceMotion}
      animationDuration={150}
    />
  )

  const plot = (
    <>
      {type === "pie" ? (
        <div className="gap-6 flex flex-wrap items-center justify-center">
          <div className="relative shrink-0" style={{ width: height, height }}>
            {empty ? null : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {tooltip}
                  <Pie
                    data={data}
                    dataKey={series[0].key}
                    nameKey="label"
                    innerRadius="66%"
                    outerRadius="100%"
                    paddingAngle={2}
                    stroke="none"
                    {...anim}
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={`var(--chart-series-${(i % 5) + 1})`}
                        className="transition-opacity duration-200 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            {center ? (
              <div className="inset-0 pointer-events-none absolute flex flex-col items-center justify-center">
                <span className="font-semibold leading-5 text-[17px] text-text-primary">
                  {center.value}
                </span>
                {center.label ? (
                  <span className="leading-3 text-[11px] text-text-secondary">
                    {center.label}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          {empty ? null : (
            <ul className="min-w-24 gap-3.5 flex flex-1 flex-col">
              {data.map((d, i) => (
                <li key={d.label} className="flex">
                  <LegendItem
                    tone={seriesTone(i)}
                    value={fmt(series[0], d[series[0].key])}
                    className="w-full"
                  >
                    {d.label}
                  </LegendItem>
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
                  <BarChart
                    data={data}
                    margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--chart-grid)"
                    />
                    <XAxis {...AXIS} />
                    {tooltip}
                    {series.map((s, i) => (
                      <Bar
                        key={s.key}
                        dataKey={s.key}
                        fill={seriesColor(s, i)}
                        radius={[4, 4, 0, 0]}
                        {...anim}
                      />
                    ))}
                  </BarChart>
                ) : type === "line" ? (
                  <LineChart
                    data={data}
                    margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--chart-grid)"
                    />
                    <XAxis {...AXIS} />
                    {tooltip}
                    {series.map((s, i) => (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        stroke={seriesColor(s, i)}
                        strokeWidth={2}
                        dot={{
                          r: 3,
                          strokeWidth: 2,
                          fill: "var(--surface-card)",
                        }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        {...anim}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <AreaChart
                    data={data}
                    margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--chart-grid)"
                    />
                    <XAxis {...AXIS} />
                    {tooltip}
                    {series.map((s, i) => (
                      <Area
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        stroke={seriesColor(s, i)}
                        strokeWidth={2}
                        fill={
                          i === 0 ? "var(--chart-area-fill)" : seriesColor(s, i)
                        }
                        fillOpacity={1}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        {...anim}
                      />
                    ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
          {empty ? null : (
            <div className="gap-4 flex flex-wrap">
              {series.map((s, i) => (
                <LegendItem key={s.key} tone={seriesTone(i)}>
                  {s.label}
                </LegendItem>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )

  // Embedded (InsightCards) plots stay bare; a titled chart is a framed card.
  if (headerless) {
    return (
      <div
        data-slot="chart"
        data-type={type}
        className={cn("w-80 gap-2 flex max-w-full flex-col", className)}
        {...props}
      >
        {plot}
      </div>
    )
  }
  return (
    <CardFrame
      data-slot="chart"
      data-type={type}
      className={cn(
        "w-80 max-w-full [--frame-radius:var(--radius-md)]",
        className
      )}
      {...props}
    >
      <CardFrameHeader className="gap-x-3 gap-y-2 px-3.5 py-3 flex flex-row flex-wrap items-start justify-between">
        <div className="min-w-0 basis-36 gap-0.5 flex flex-1 flex-col">
          <span className="font-semibold leading-4 text-[13px] text-text-primary">
            {title}
          </span>
          {subtitle ? (
            <span className="leading-3 text-[11px] text-text-secondary">
              {subtitle}
            </span>
          ) : null}
        </div>
        {reference ? (
          <Reference
            {...reference}
            className={cn("max-w-full shrink-0", reference.className)}
          />
        ) : (
          <Pill>{badge ?? TYPE_LABEL[type]}</Pill>
        )}
      </CardFrameHeader>
      <Card>
        <CardPanel className="gap-3 p-3.5 flex flex-col">{plot}</CardPanel>
      </Card>
    </CardFrame>
  )
}
