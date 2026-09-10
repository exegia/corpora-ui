import * as React from "react"

import { DemoSelect, DemoStage } from "@/components/docs/demo-controls"
import { AiBubble, type AiBubbleContent } from "@/components/blocks/chat"
import { SAMPLE } from "./markdown-demo"

const KINDS = ["markdown", "research", "chart", "streaming"] as const

const CONTENT: Record<(typeof KINDS)[number], AiBubbleContent> = {
  markdown: { kind: "markdown", markdownId: "bubble", source: SAMPLE },
  research: {
    kind: "research",
    kickerSub: "Answered from 3 passages · 0.8 s",
    content: "The quarrel opens when Agamemnon refuses Chryses’ ransom. Apollo’s plague follows, and only Achilles’ call for an assembly forces the priest’s daughter to be returned — the first boundary of the poem (¶12, RC003).",
    source: "Iliad · Homer corpus",
    date: "c. 750 BCE · Sep 2",
    authors: "Homer · M. L. West",
  },
  chart: {
    kind: "chart",
    type: "bar",
    title: "Sales by flavor",
    subtitle: "Units · last 6 months",
    data: [{ label: "Pist.", units: 62 }, { label: "Vanilla", units: 88 }, { label: "Mint", units: 70 }, { label: "Choc.", units: 100 }, { label: "Mango", units: 74 }, { label: "Rocky", units: 48 }],
    series: [{ key: "units", label: "Units sold" }],
  },
  streaming: {
    kind: "streaming",
    streaming: true,
    paragraphs: ["Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points.", [{ cite: "scoopdata.io", title: "Scoop Data · Flavor report", description: "Monthly flavor velocity across 1,200 parlours.", href: "https://scoopdata.io" }, ...("Stone-fruit flavors trend in the same range.".split(" ").map((text) => ({ text })))]],
  },
}

export default function AiBubbleDemo(): React.ReactElement {
  const [kind, setKind] = React.useState<(typeof KINDS)[number]>("markdown")
  return (
    <DemoStage
      canvasClassName="flex min-h-24 w-full justify-center p-6"
      controls={<DemoSelect label="content" options={KINDS} value={kind} onChange={setKind} />}
    >
      <AiBubble key={kind} time="2 min ago" content={CONTENT[kind]} />
    </DemoStage>
  )
}
