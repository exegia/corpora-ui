"use client"

import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Chart } from "@/components/composed/chat"
import {
  commentariesByAuthor,
  crossReferencesByVerse,
  cumulativeCrossReferences,
  wordOccurrences,
} from "./corpus-chart-data"

const commentaryCount = commentariesByAuthor.reduce(
  (total, row) => total + row.commentaries,
  0
)

export default function ChartDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="grid w-full grid-cols-1 gap-4 p-6 md:grid-cols-2">
      <Chart
        type="pie"
        interactive
        variant="donut"
        title="Commentaries by author"
        subtitle="Entries on the selected verse"
        reference={{
          children: "John 3:16",
          preview:
            "Commentary entries grouped by author for John 3:16 in the illustrative corpus.",
        }}
        data={commentariesByAuthor}
        series={[{ key: "commentaries", label: "Commentaries" }]}
        center={{ value: commentaryCount, label: "entries" }}
      />
      <Chart
        type="area"
        interactive
        plotHeight={210}
        brush
        title="Cross-reference coverage"
        subtitle="Cumulative links through the passage"
        reference={{
          children: "John 3:14–18",
          preview:
            "Running total of cross-reference links from John 3:14 through each verse. Repeated targets count once per source verse.",
        }}
        data={cumulativeCrossReferences}
        series={[{ key: "references", label: "Cumulative links" }]}
      />
      <Chart
        type="line"
        interactive
        title="Cross-references"
        subtitle="Linked passages by testament"
        reference={{
          children: "John 3:14–18",
          preview:
            "Cross-reference counts per source verse, grouped by the testament of the linked passage.",
        }}
        data={crossReferencesByVerse}
        series={[
          { key: "oldTestament", label: "Old Testament" },
          { key: "newTestament", label: "New Testament" },
        ]}
      />
      <Chart
        type="bar"
        interactive
        title="Word occurrences"
        subtitle="Matched tokens by Bible book"
        reference={{
          children: "Strong’s G26",
          preview:
            "Tokens indexed under Strong’s G26, grouped by book in the illustrative corpus.",
        }}
        data={wordOccurrences}
        series={[
          {
            key: "occurrences",
            label: "Occurrences",
            bar: { variant: "gradient" },
          },
        ]}
      />
      <p className="text-xs md:col-span-2 text-muted-foreground">
        Illustrative corpus counts for these examples; not statistics from a
        published Bible edition or commentary collection.
      </p>
    </DemoStage>
  )
}
