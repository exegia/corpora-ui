"use client"
import { useRender } from "@base-ui/react/use-render"
import { useImperativeHandle } from "react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardFrame,
  CardFrameHeader,
  CardPanel,
} from "@/components/ui/card"
import { Pill } from "@/components/ui/chat"
import { Reference } from "@/components/atoms/reference"
import { ChartContext } from "./chart-context"
import { ChartPlot } from "./chart-plot"
import { ChartLegend } from "./chart-legend"
import { CHART_DEFAULT_HEIGHT, CHART_TYPE_LABEL } from "./constants"
import { useChart } from "./use-chart"
import type { IChartProps } from "./type"

export function ChartRoot({
  ref,
  ...allProps
}: IChartProps): React.ReactElement {
  const { id, selectedKey, actions } = useChart(allProps)
  useImperativeHandle(ref, () => actions, [actions])
  return (
    <ChartContext value={id}>
      <ChartCard
        {...allProps}
        selectedKey={selectedKey}
        onSelectionChange={actions.select}
      />
    </ChartContext>
  )
}
function ChartCard({
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
  width,
  height,
  render,
  style,
  className,
  chartId: _chartId,
  ref: _ref,
  defaultSelectedKey: _defaultSelectedKey,
  variant = "default",
  renderer,
  animation,
  loading = false,
  emptyContent = "No data",
  showLegend = true,
  interactive = false,
  selectedKey,
  onSelectionChange,
  curveType,
  grid,
  xAxis,
  yAxis,
  tooltip,
  brush,
  pie,
  chartOptions,
  children,
  ...props
}: IChartProps): React.ReactElement {
  const fillHeight =
    (height !== undefined || style?.height !== undefined) &&
    plotHeight === undefined
  const plotSize = fillHeight
    ? "100%"
    : (plotHeight ?? (type === "pie" ? 140 : CHART_DEFAULT_HEIGHT))
  const rootStyle = { width, height, ...style }
  const empty = data.length === 0 || series.length === 0
  const legend =
    !empty && !loading && showLegend ? (
      <ChartLegend
        type={type}
        data={data}
        series={series}
        selectedKey={selectedKey}
        interactive={interactive}
        onSelect={(key) =>
          onSelectionChange?.(selectedKey === key ? null : key)
        }
      />
    ) : null
  const plot = (
    <>
      <div
        className={cn(
          "min-w-0",
          fillHeight && "min-h-0 flex flex-1 flex-col",
          type === "pie" &&
            "gap-6 flex flex-row flex-wrap items-center justify-center"
        )}
        aria-busy={loading}
      >
        <div
          className={cn(
            "min-w-0 relative",
            type === "pie" ? "shrink-0" : "w-full"
          )}
          style={{
            height: plotSize,
            width:
              type === "pie" ? (fillHeight ? "auto" : plotSize) : undefined,
            maxWidth: "100%",
            aspectRatio: type === "pie" ? "1" : undefined,
          }}
          role="group"
          aria-label={
            typeof title === "string"
              ? title
              : `${CHART_TYPE_LABEL[type]} chart`
          }
        >
          {empty && !loading ? (
            <div
              role="status"
              className="text-xs flex h-full items-center justify-center text-text-secondary"
            >
              {emptyContent}
            </div>
          ) : (
            <ChartPlot
              type={type}
              data={data}
              series={series}
              variant={variant}
              renderer={renderer}
              animation={animation}
              loading={loading}
              interactive={interactive}
              selectedKey={selectedKey}
              onSelectionChange={onSelectionChange}
              curveType={curveType}
              grid={grid}
              xAxis={xAxis}
              yAxis={yAxis}
              tooltip={tooltip}
              brush={brush}
              pie={pie}
              chartOptions={chartOptions}
            />
          )}
          {type === "pie" && center && !loading ? (
            <div className="inset-0 pointer-events-none absolute flex flex-col items-center justify-center">
              <span className="font-semibold text-[17px] text-text-primary">
                {center.value}
              </span>
              {center.label && (
                <span className="text-[11px] text-text-secondary">
                  {center.label}
                </span>
              )}
            </div>
          ) : null}
        </div>
        {type === "pie" && legend}
      </div>
      {type !== "pie" && legend}
      {children}
    </>
  )
  const bareRoot = useRender({
    defaultTagName: "div",
    render: headerless ? render : undefined,
    props: {
      ...props,
      "data-slot": "chart",
      "data-type": type,
      className: cn("w-80 gap-2 flex max-w-full flex-col", className),
      style: rootStyle,
      children: plot,
    },
  })
  if (headerless) return bareRoot
  return (
    <CardFrame
      render={render}
      style={rootStyle}
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
          <Pill>{badge ?? CHART_TYPE_LABEL[type]}</Pill>
        )}
      </CardFrameHeader>
      <Card className={cn(fillHeight && "min-h-0 flex-1")}>
        <CardPanel
          className={cn("gap-3 p-3.5 flex flex-col", fillHeight && "min-h-0")}
        >
          {plot}
        </CardPanel>
      </Card>
    </CardFrame>
  )
}
