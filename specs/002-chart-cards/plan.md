# 002 — Plan

Files: `composed/chat/chart.tsx`, `ui/chat/legend-item.tsx`, `ui/chat/dot.tsx`,
`ui/chat/pill.tsx`, demo `registry/demos/chart-demo.tsx`.

1. `bun add recharts` in `react/`. Recharts renders SVG; colours passed as
   `var(--chart-series-1)` strings so theme switches without re-render.
2. One `Chart` component: shared card + header, `switch(type)` to a small
   Recharts tree each (PieChart/AreaChart/LineChart/BarChart inside
   `ResponsiveContainer`). No axis lines, only `CartesianGrid` horizontal.
3. Legend is our `LegendItem` list, not Recharts' legend, so it matches the
   frame (pie: dot · label · value; others: dot · label).
4. Test: renders four types with sample data, empty data does not throw.

Dependency: `recharts` (new).
