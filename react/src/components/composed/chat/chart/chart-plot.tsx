"use client"
import { useMemo, useEffect, useRef, useState } from "react"
import { EChartsAreaChart as Area } from "./evilcharts/echarts-area-chart"
import { EChartsLineChart as Line } from "./evilcharts/echarts-line-chart"
import { EChartsBarChart as Bar } from "./evilcharts/echarts-bar-chart"
import { EChartsPieChart as Pie } from "./evilcharts/echarts-pie-chart"
import { resolveTooltipPosition } from "./evilcharts/echarts-tooltip"
import { buildChartConfig } from "./utils"
import { createChartTooltip } from "./chart-tooltip"
import type { IChartProps } from "./type"

/** Wait for layout before initializing ECharts (also supports hidden tabs and SSR). */
export function ChartPlot(props: IChartProps) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const node = host.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      if (
        entries.some(
          (entry) => entry.contentRect.width > 0 && entry.contentRect.height > 0
        )
      )
        setReady(true)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={host} className="h-full w-full">
      {ready && <ChartRenderer {...props} />}
    </div>
  )
}

function ChartRenderer({
  type,
  data,
  series,
  variant = "default",
  renderer = "canvas",
  animation = true,
  loading = false,
  interactive = false,
  selectedKey = null,
  onSelectionChange,
  curveType = "monotone",
  grid = true,
  xAxis = true,
  yAxis = false,
  tooltip = true,
  brush = false,
  pie,
  chartOptions,
}: IChartProps) {
  const config = useMemo(
    () => buildChartConfig(type, data, series),
    [type, data, series]
  )
  const options = useMemo(
    () => ({
      ...(tooltip
        ? {
            tooltip: {
              show: !loading,
              trigger: type === "pie" ? "item" : "axis",
              confine: true,
              padding: 0,
              borderWidth: 0,
              backgroundColor: "transparent",
              // Only the inner tooltip owns a shadow; ECharts adds one otherwise.
              extraCssText: "box-shadow:none;",
              axisPointer: {
                type:
                  typeof tooltip === "object" && tooltip.cursor === false
                    ? "none"
                    : "line",
              },
              position: resolveTooltipPosition(
                typeof tooltip === "object"
                  ? (tooltip.position ?? "variable")
                  : "variable"
              ),
              formatter: createChartTooltip(
                type,
                data,
                series,
                typeof tooltip === "object" ? tooltip : {}
              ),
            },
          }
        : {}),
      ...chartOptions,
    }),
    [tooltip, loading, type, data, series, chartOptions]
  )
  const common = {
    data,
    config,
    renderer,
    animation,
    isLoading: loading,
    chartOptions: options,
    className: "h-full w-full",
  }
  const selection = { selectedDataKey: selectedKey, onSelectionChange }
  const tooltipProps = typeof tooltip === "object" ? tooltip : {}
  const xProps = typeof xAxis === "object" ? xAxis : {}
  const yProps = typeof yAxis === "object" ? yAxis : {}
  const brushProps = typeof brush === "object" ? brush : {}
  if (type === "pie")
    return (
      <Pie
        {...common}
        dataKey={series[0]?.key ?? "value"}
        nameKey="label"
        selectedSector={selectedKey}
        onSelectionChange={(value) =>
          onSelectionChange?.(value?.dataKey ?? null)
        }
      >
        <Pie.Pie
          innerRadius={variant === "donut" || variant === "default" ? "66%" : 0}
          outerRadius="95%"
          paddingAngle={2}
          cornerRadius={8}
          isClickable={interactive}
          {...pie}
        />
        {tooltip && <Pie.Tooltip {...tooltipProps} />}
      </Pie>
    )
  if (type === "bar")
    return (
      <Bar
        {...common}
        {...selection}
        xDataKey="label"
        barRadius={8}
        layout={variant === "horizontal" ? "horizontal" : "vertical"}
        stackType={
          variant === "percent"
            ? "percent"
            : variant === "stacked"
              ? "stacked"
              : "default"
        }
      >
        {series.map((s) => (
          <Bar.Bar
            key={s.key}
            dataKey={s.key}
            isClickable={interactive}
            {...s.bar}
          />
        ))}
        {xAxis && <Bar.XAxis {...xProps} />}
        {yAxis && (
          <Bar.YAxis
            {...yProps}
            tickFormatter={
              yProps.tickFormatter
                ? (value, index) => yProps.tickFormatter!(Number(value), index)
                : undefined
            }
          />
        )}
        {grid && <Bar.Grid />}
        {tooltip && <Bar.Tooltip {...tooltipProps} />}
        {brush && variant !== "horizontal" && <Bar.Brush {...brushProps} />}
      </Bar>
    )
  if (type === "line")
    return (
      <Line
        {...common}
        {...selection}
        xDataKey="label"
        curveType={curveType}
        enableHoverHighlight={interactive}
      >
        {series.map((s) => (
          <Line.Line
            key={s.key}
            dataKey={s.key}
            isClickable={interactive}
            {...s.line}
          >
            <Line.Dot />
            <Line.ActiveDot />
          </Line.Line>
        ))}
        {xAxis && <Line.XAxis {...xProps} />}
        {yAxis && <Line.YAxis {...yProps} />}
        {grid && <Line.Grid />}
        {tooltip && <Line.Tooltip {...tooltipProps} />}
        {brush && <Line.Brush {...brushProps} />}
      </Line>
    )
  return (
    <Area
      {...common}
      {...selection}
      xDataKey="label"
      curveType={curveType}
      enableHoverHighlight={interactive}
      stackType={
        variant === "percent"
          ? "expanded"
          : variant === "stacked"
            ? "stacked"
            : "default"
      }
    >
      {series.map((s) => (
        <Area.Area
          key={s.key}
          dataKey={s.key}
          isClickable={interactive}
          {...s.area}
        >
          <Area.ActiveDot />
        </Area.Area>
      ))}
      {xAxis && <Area.XAxis {...xProps} />}
      {yAxis && <Area.YAxis {...yProps} />}
      {grid && <Area.Grid />}
      {tooltip && <Area.Tooltip {...tooltipProps} />}
      {brush && <Area.Brush {...brushProps} />}
    </Area>
  )
}
