import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Chart } from "@/components/composed/chat"

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"]
const growth = [120, 260, 240, 380, 420, 560, 700].map((v, i) => ({ label: WEEKS[i], nodes: v }))
const revenue = [30, 34, 28, 40, 44, 52, 58].map((v, i) => ({ label: WEEKS[i], revenue: v, forecast: 32 + i * 4 }))
const flavors = [{ label: "Pist.", units: 62 }, { label: "Vanilla", units: 88 }, { label: "Mint", units: 70 }, { label: "Choc.", units: 100 }, { label: "Mango", units: 74 }, { label: "Rocky", units: 48 }]
const share = [{ label: "Iliad", value: 42 }, { label: "Odyssey", value: 26 }, { label: "Hesiod", value: 18 }, { label: "Hymns", value: 14 }]
const pct = (v: number) => `${v}%`
const usd = (v: number) => `$${v}k`

export default function ChartDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="grid w-full grid-cols-1 gap-4 p-6 md:grid-cols-2">
      <Chart type="pie" title="Share by corpus" subtitle="Queries · this month" data={share} series={[{ key: "value", label: "Share", format: pct }]} center={{ value: "1,284", label: "queries" }} />
      <Chart type="area" title="Corpus growth" subtitle="Nodes indexed · last 7 weeks" data={growth} series={[{ key: "nodes", label: "Nodes" }]} />
      <Chart type="line" title="Revenue vs. forecast" subtitle="$ · weekly, last 7 weeks" data={revenue} series={[{ key: "revenue", label: "Revenue", format: usd }, { key: "forecast", label: "Forecast", format: usd }]} />
      <Chart type="bar" title="Sales by flavor" subtitle="Units · last 6 months" data={flavors} series={[{ key: "units", label: "Units sold" }]} />
    </DemoStage>
  )
}
