import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { InsightCards, InsightEntity } from "@/components/composed/chat"

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"]
const coverage = [61, 64, 63, 68, 70, 74, 79].map((v, i) => ({ label: WEEKS[i], iliad: v, odyssey: 48 + i * 4 }))
const hapax = [1180, 1164, 1151, 1133, 1120, 1097, 1072].map((v, i) => ({ label: WEEKS[i], hapax: v }))

export default function InsightCardsDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <InsightCards
        insights={[
          {
            summary: <>Lexicon coverage of the <InsightEntity>Iliad</InsightEntity> passed the Odyssey this week — 79% of tokens now resolve to a lemma.</>,
            stats: [
              { tone: "series-1", label: "Iliad", value: "79%", delta: "+5 pts", trend: "positive" },
              { tone: "series-2", label: "Odyssey", value: "72%", delta: "+2 pts", trend: "positive" },
            ],
            snapshot: { label: "Coverage · 7 weeks", data: coverage, series: [{ key: "iliad", label: "Iliad" }, { key: "odyssey", label: "Odyssey" }] },
            followUp: "Which lemmas are still unresolved?",
          },
          {
            summary: <>Hapax legomena in <InsightEntity>Hesiod</InsightEntity> keep shrinking as the lexicon links more variant spellings.</>,
            stats: [
              { tone: "series-3", label: "Hapax", value: "1,072", delta: "-108", trend: "positive" },
              { tone: "series-4", label: "Unlinked forms", value: "312", delta: "-41", trend: "positive" },
            ],
            snapshot: { label: "Hapax count", badge: "Trend", data: hapax, series: [{ key: "hapax", label: "Hapax", color: "var(--chart-series-3)" }] },
            followUp: "Show the newest links",
          },
          {
            summary: <>The <InsightEntity>Homeric Hymns</InsightEntity> have 14 lemmas flagged for review after the last import.</>,
            stats: [{ tone: "series-5", label: "Flagged lemmas", value: "14", delta: "+9", trend: "negative" }],
            followUp: "Open the review queue",
          },
        ]}
      />
    </DemoStage>
  )
}
