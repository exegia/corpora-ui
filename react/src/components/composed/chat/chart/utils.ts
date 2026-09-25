import type { ChartConfig } from "./evilcharts/echarts-chart"
import type { IChartSeries, TChartDatum, TChartType } from "./type"
export function chartSeriesColor(series: IChartSeries, index: number) {
  return series.color ?? `var(--chart-series-${(index % 5) + 1})`
}
export function formatChartValue(
  series: IChartSeries | undefined,
  value: unknown
) {
  return typeof value === "number" && series?.format
    ? series.format(value)
    : String(value ?? "—")
}
export function buildChartConfig(
  type: TChartType,
  data: TChartDatum[],
  series: IChartSeries[]
): ChartConfig {
  const entries =
    type === "pie"
      ? data.map(
          (row, index) =>
            [
              row.label,
              {
                label: row.label,
                colors: { light: [`var(--chart-series-${(index % 5) + 1})`] },
              },
            ] as const
        )
      : series.map(
          (item, index) =>
            [
              item.key,
              {
                label: item.label,
                colors: { light: [chartSeriesColor(item, index)] },
              },
            ] as const
        )
  return Object.fromEntries(
    entries.map(([key, value]) => [
      key,
      { ...value, colors: { light: [...value.colors.light] } },
    ])
  )
}
