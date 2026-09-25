import { renderToStaticMarkup } from "react-dom/server"
import type { TooltipProps } from "./evilcharts/echarts-area-chart"
import {
  roundnessClass,
  tooltipVariantClass,
} from "./evilcharts/echarts-tooltip"
import { cn } from "@/lib/utils"
import { chartSeriesColor, formatChartValue } from "./utils"
import type { IChartSeries, TChartDatum, TChartType } from "./type"
/** React escapes labels and formatted nodes before they enter ECharts' HTML tooltip. */
export function createChartTooltip(
  type: TChartType,
  data: TChartDatum[],
  series: IChartSeries[],
  options: TooltipProps = {}
) {
  return (params: unknown) => {
    const rows = (Array.isArray(params) ? params : [params]).filter(
      (row): row is Record<string, unknown> =>
        typeof row === "object" && row !== null
    )
    return renderToStaticMarkup(
      <div
        data-slot="chart-tooltip"
        style={{ boxShadow: "0 4px 12px rgb(0 0 0 / 0.12)" }}
        className={cn(
          "p-2.5 text-xs border border-border-default text-text-primary",
          roundnessClass[options.roundness ?? "md"],
          tooltipVariantClass[options.variant ?? "frosted-glass"]
        )}
      >
        {type !== "pie" && (
          <div className="mb-1 font-medium">
            {data[Number(rows[0]?.dataIndex)]?.label}
          </div>
        )}
        {rows
          .filter((row) => !String(row.seriesId ?? "").startsWith("__"))
          .map((row, i) => {
            const item =
              type === "pie"
                ? series[0]
                : (series.find(
                    (s) => s.key === row.seriesId || s.key === row.seriesName
                  ) ?? series[Number(row.seriesIndex)])
            const datum = data[Number(row.dataIndex)]
            return (
              <div key={i} className="gap-3 flex items-center">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    background:
                      type === "pie"
                        ? `var(--chart-series-${(Number(row.dataIndex) % 5) + 1})`
                        : item
                          ? chartSeriesColor(item, series.indexOf(item))
                          : undefined,
                  }}
                />
                <span>{type === "pie" ? datum?.label : item?.label}</span>
                <span className="font-medium ml-auto">
                  {formatChartValue(
                    item,
                    datum && item ? datum[item.key] : row.value
                  )}
                </span>
              </div>
            )
          })}
      </div>
    )
  }
}
