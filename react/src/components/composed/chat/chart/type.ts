import type { useRender } from "@base-ui/react/use-render"
import type * as React from "react"
import type { Reference } from "@/components/atoms/reference"
import type {
  AreaProps,
  CurveType,
  TooltipProps,
  XAxisProps,
  YAxisProps,
} from "./evilcharts/echarts-area-chart"
import type { BarProps } from "./evilcharts/echarts-bar-chart"
import type { LineProps } from "./evilcharts/echarts-line-chart"
import type { PieProps } from "./evilcharts/echarts-pie-chart"
import type { BrushProps } from "./evilcharts/echarts-brush"
import type { EChartsRenderer } from "./evilcharts/echarts-chart"

export type TChartType = "pie" | "area" | "line" | "bar"
export type TChartVariant =
  "default" | "stacked" | "percent" | "donut" | "horizontal"
export type TChartInstanceId = string
export type TChartDatum = {
  label: string
  [key: string]: string | number | null
}
export interface IChartSeries {
  key: string
  label: React.ReactNode
  color?: string
  format?: (value: number) => React.ReactNode
  area?: Omit<AreaProps, "dataKey" | "children">
  line?: Omit<LineProps, "dataKey" | "children">
  bar?: Omit<BarProps, "dataKey">
}
export interface IChartState {
  selectedKey: string | null
}
export interface IChartStateActions {
  select: (key: string | null) => void
  toggle: (key: string) => void
  clearSelection: () => void
  reset: () => void
}
export interface IChartProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "title"
> {
  type: TChartType
  /** Unique within the current Jotai store. Omit for an isolated generated id. */
  chartId?: TChartInstanceId
  title?: React.ReactNode
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  reference?: React.ComponentProps<typeof Reference>
  data: TChartDatum[]
  series: IChartSeries[]
  center?: { value: React.ReactNode; label?: React.ReactNode }
  headerless?: boolean
  /** Outer component width. Numbers are pixels; CSS lengths such as "100%" work. */
  width?: React.CSSProperties["width"]
  /** Outer component height, including header and legend. Plot fills remaining space. */
  height?: React.CSSProperties["height"]
  /** Explicit plot height takes precedence over filling the outer height. */
  plotHeight?: React.CSSProperties["height"]
  /** Replace the outer element using the coss/Base UI render API. */
  render?: useRender.ComponentProps<"div">["render"]
  /** stacked/percent: area or bar; horizontal: bar; donut: pie. */
  variant?: TChartVariant
  renderer?: EChartsRenderer
  animation?: boolean
  loading?: boolean
  emptyContent?: React.ReactNode
  showLegend?: boolean
  interactive?: boolean
  selectedKey?: string | null
  defaultSelectedKey?: string | null
  onSelectionChange?: (key: string | null) => void
  curveType?: CurveType
  grid?: boolean
  xAxis?: boolean | XAxisProps
  yAxis?: boolean | YAxisProps
  tooltip?: boolean | TooltipProps
  brush?: boolean | BrushProps
  pie?: Omit<PieProps, "children">
  /** ECharts options override generated options at the top level. */
  chartOptions?: Record<string, unknown>
  /** Selection methods; also available via useChartActions(chartId). */
  ref?: React.Ref<IChartStateActions>
}
