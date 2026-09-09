import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { InsightCards, InsightEntity } from "@/components/composed/chat"

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"]
const trend = [40, 46, 38, 52, 44, 60, 72].map((a, i) => ({ label: WEEKS[i], mint: a, pistachio: 30 + i * 6 }))

export default function InsightCardsDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <InsightCards
        insights={[
          {
            summary: <>The worst performer in your <InsightEntity>Creamery</InsightEntity> is Rocky Road — down -6% or -$2,453.44.</>,
            stats: [
              { tone: "series-1", label: "Mint Chip", value: "-4.41%", delta: "-$2,377.66", trend: "negative" },
              { tone: "series-3", label: "Pistachio", value: "+1.15%", delta: "+$617.22", trend: "positive" },
            ],
            snapshot: { data: trend, series: [{ key: "mint", label: "Mint Chip" }, { key: "pistachio", label: "Pistachio", color: "var(--chart-series-2)" }] },
            followUp: "Should I rebalance flavors?",
          },
          {
            summary: <>Vanilla margins in <InsightEntity>Retail</InsightEntity> recovered after the March price change.</>,
            stats: [
              { tone: "series-2", label: "Vanilla", value: "+3.2%", delta: "+$1,204.10", trend: "positive" },
              { tone: "series-4", label: "Mango", value: "-0.8%", delta: "-$212.00", trend: "negative" },
            ],
          },
          { summary: "Cone inventory covers 11 days at current velocity.", stats: [{ label: "Cones", value: "11 days", trend: "positive" }] },
        ]}
      />
    </DemoStage>
  )
}
