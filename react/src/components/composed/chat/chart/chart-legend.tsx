"use client"
import type { CSSProperties } from "react"
import { LegendItem, type TDotTone } from "@/components/ui/chat"
import { cn } from "@/lib/utils"
import { chartSeriesColor, formatChartValue } from "./utils"
import type { IChartProps } from "./type"
export function ChartLegend({
  type,
  data,
  series,
  selectedKey,
  interactive,
  onSelect,
}: Pick<
  IChartProps,
  "type" | "data" | "series" | "selectedKey" | "interactive"
> & { onSelect: (key: string) => void }) {
  const entries =
    type === "pie"
      ? data.map((row, i) => ({
          key: row.label,
          label: row.label,
          value: formatChartValue(series[0], row[series[0].key]),
          color: `var(--chart-series-${(i % 5) + 1})`,
        }))
      : series.map((s, i) => ({
          key: s.key,
          label: s.label,
          value: undefined,
          color: chartSeriesColor(s, i),
        }))
  return (
    <ul
      data-slot="chart-legend"
      className={cn(
        "gap-3 flex flex-wrap",
        type === "pie" && "min-w-24 flex-1 flex-col"
      )}
    >
      {entries.map((entry, i) => (
        <li
          key={entry.key}
          style={{ "--legend-color": entry.color } as CSSProperties}
          className={cn(
            "min-w-0 [&_[data-slot=dot]]:bg-(--legend-color)",
            selectedKey && selectedKey !== entry.key && "opacity-40"
          )}
        >
          {interactive ? (
            <button
              type="button"
              aria-pressed={selectedKey === entry.key}
              className="w-full rounded-sm text-left focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => onSelect(entry.key)}
            >
              <LegendItem
                tone={`series-${(i % 5) + 1}` as TDotTone}
                value={entry.value}
              >
                {entry.label}
              </LegendItem>
            </button>
          ) : (
            <LegendItem
              tone={`series-${(i % 5) + 1}` as TDotTone}
              value={entry.value}
            >
              {entry.label}
            </LegendItem>
          )}
        </li>
      ))}
    </ul>
  )
}
