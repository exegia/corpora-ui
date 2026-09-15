# 002 — Chart cards

**Status:** draft · **Sketch:** `AI Presentation — Light|Dark`, row "COMPONENT / CHART — pie · area · line · bar"
**Depends on:** 001 (tokens, Pill)

## Problem

AI answers return small datasets (share by corpus, corpus growth, revenue vs
forecast, sales by flavor). The design shows one 320×244 card for four chart
types with the same chrome. Nothing in the repo renders charts.

## Solution

`Chart` (`composed/chat/chart.tsx`) with `type="pie|area|line|bar"`, built on
Recharts. Colours bound to `--chart-series-1…5`, grid to `--chart-grid`, area
fill to `--chart-area-fill`. Atoms: `LegendItem` (dot + label), `Dot`
(`tone="series-1…5"` and semantic tones), `Pill` (type badge).

## Acceptance criteria

- [ ] AC-1 Card 320×244 (fluid width, fixed 244 height by default), radius 12, card surface, default border; header: title 13/600 + subtitle 11 secondary left, type Pill ("Pie", "Area", "Line", "Bar") top-right.
- [ ] AC-2 Pie: 140px donut, centre value 17/600 + label 11 secondary ("1,284 / queries"); right column legend rows with dot, label, and value ("Iliad 42%").
- [ ] AC-3 Area: single series stroke `series-1` with `chart-area-fill`, horizontal grid lines `chart-grid`, x labels W1…W7 11px secondary, legend below plot.
- [ ] AC-4 Line: two series (`series-1`, `series-2`) with point markers, grid, x labels, legend of two items.
- [ ] AC-5 Bar: single series bars radius 4 in `series-1`, x labels (abbreviated), legend "Units sold".
- [ ] AC-6 Series colours cycle `--chart-series-1…5`; a `series[i].color` override is allowed but defaults to the token.
- [ ] AC-7 Light and dark swap via CSS variables only (no theme prop).
- [ ] AC-8 Empty `data` renders the chrome with an empty plot area and no legend (no crash).
- [ ] AC-9 Registry entry + demo showing all four types; `make check`.

## Open questions
- Tooltips/hover are not in the design; Recharts tooltips are left off (`interactive` prop reserved, default false).
