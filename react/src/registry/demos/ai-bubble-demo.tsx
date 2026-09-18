"use client"

import * as React from "react"

import { DemoSelect, DemoStage } from "@/components/docs/demo-controls"
import { Chart, Markdown } from "@/components/composed/chat"
import AI from "@/components/composed/ai"
import { SAMPLE } from "./markdown-demo"
import { wordOccurrences } from "./corpus-chart-data"

const KINDS = ["markdown", "research", "chart", "streaming"] as const

const CONTENT: Record<(typeof KINDS)[number], React.ReactNode> = {
  markdown: <Markdown markdownId="bubble" source={SAMPLE} />,
  research: (
    <AI.ResearchAnswer
      kickerSub="Answered from 3 passages · 0.8 s"
      content="The quarrel opens when Agamemnon refuses Chryses’ ransom. Apollo’s plague follows, and only Achilles’ call for an assembly forces the priest’s daughter to be returned — the first boundary of the poem (¶12, RC003)."
      source={{
        label: "Iliad · Homer corpus",
        title: "Iliad — Homer corpus",
        description:
          "Book 1: the quarrel between Agamemnon and Achilles opens the poem.",
        href: "https://corpora.dev/iliad",
      }}
      date="c. 750 BCE · Sep 2"
      authors={{
        label: "Homer · M. L. West",
        title: "Homer — author record",
        description:
          "Attribution follows M. L. West's critical edition of the corpus.",
        href: "https://corpora.dev/homer",
      }}
    />
  ),
  chart: (
    <Chart
      type="bar"
      title="Word occurrences by book"
      subtitle="Illustrative counts · selected Bible books"
      reference={{ children: "Strong’s G26" }}
      data={wordOccurrences}
      series={[{ key: "occurrences", label: "Occurrences" }]}
    />
  ),
  streaming: (
    <AI.StreamingText
      streaming
      paragraphs={[
        "Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points.",
        [
          {
            cite: "scoopdata.io",
            title: "Scoop Data · Flavor report",
            description: "Monthly flavor velocity across 1,200 parlours.",
            href: "https://scoopdata.io",
          },
          ..."Stone-fruit flavors trend in the same range."
            .split(" ")
            .map((text) => ({ text })),
        ],
      ]}
    />
  ),
}

export default function AiBubbleDemo(): React.ReactElement {
  const [kind, setKind] = React.useState<(typeof KINDS)[number]>("markdown")
  return (
    <DemoStage
      canvasClassName="flex min-h-24 w-full justify-center p-6"
      controls={
        <DemoSelect
          label="content"
          options={KINDS}
          value={kind}
          onChange={setKind}
        />
      }
    >
      <AI.Message key={kind} type="markdown">
        {CONTENT[kind]}
      </AI.Message>
    </DemoStage>
  )
}
