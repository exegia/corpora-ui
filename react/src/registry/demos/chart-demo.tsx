import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Chart } from "@/components/composed/chat"

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"]
const growth = [120, 260, 240, 380, 420, 560, 700].map((v, i) => ({ label: WEEKS[i], nodes: v }))
const revenue = [30, 34, 28, 40, 44, 52, 58].map((v, i) => ({ label: WEEKS[i], revenue: v, forecast: 32 + i * 4 }))
const flavors = [{ label: "Pist.", units: 62 }, { label: "Vanilla", units: 88 }, { label: "Mint", units: 70 }, { label: "Choc.", units: 100 }, { label: "Mango", units: 74 }, { label: "Rocky", units: 48 }]
const share = [{ label: "Iliad", share: "42%", value: 42 }, { label: "Odyssey", share: "26%", value: 26 }, { label: "Hesiod", share: "18%", value: 18 }, { label: "Hymns", share: "14%", value: 14 }]

export default function ChartDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="grid w-full grid-cols-1 gap-4 p-6 md:grid-cols-2">
      <Chart type="pie" title="Share by corpus" subtitle="Queries · this month" data={share.map((d) => ({ label: d.label, value: d.value, share: d.share }))} series={[{ key: "share", label: "Share" }]} center={{ value: "1,284", label: "queries" }} />
      <Chart type="area" title="Corpus growth" subtitle="Nodes indexed · last 7 weeks" data={growth} series={[{ key: "nodes", label: "Nodes" }]} />
      <Chart type="line" title="Revenue vs. forecast" subtitle="$ · weekly, last 7 weeks" data={revenue} series={[{ key: "revenue", label: "Revenue" }, { key: "forecast", label: "Forecast" }]} />
      <Chart type="bar" title="Sales by flavor" subtitle="Units · last 6 months" data={flavors} series={[{ key: "units", label: "Units sold" }]} />
    </DemoStage>
  )
}
