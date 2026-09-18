"use client"

import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { RecordsTable } from "@/components/composed/chat"

export default function RecordsTableDemo(): React.ReactElement {
  const [stickyHeader, setStickyHeader] = React.useState(false)
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-col items-center gap-4 p-6">
      <RecordsTable
        tableId="demo"
        stickyHeader={stickyHeader}
        className="max-h-40"
        rows={[
          { id: "1", name: "Alpine Churn — Zürich", initial: "A", tags: [{ label: "B2B", tone: "amber" }, { label: "Gelato", tone: "purple" }, { label: "Wholesale", tone: "amber" }], lastInteraction: "4 days ago", strength: "Very strong" },
          { id: "2", name: "Kumo Creamery", initial: "K", tags: [{ label: "Retail", tone: "blue" }], lastInteraction: "2 weeks ago", strength: "Strong" },
          { id: "3", name: "Maple Orbit", initial: "M", tags: [{ label: "Wholesale", tone: "amber" }, { label: "Active", tone: "green" }], lastInteraction: "Yesterday", strength: "Moderate" },
          { id: "4", name: "Coral Coast Sorbet", initial: "C", tags: [{ label: "Retail", tone: "blue" }, { label: "Gelato", tone: "purple" }, { label: "B2B", tone: "amber" }, { label: "Active", tone: "green" }], lastInteraction: "1 month ago", strength: "Weak" },
        ]}
      />
      <div className="w-full max-w-[540px]"><DemoToggle label="Sticky header" checked={stickyHeader} onChange={setStickyHeader} /></div>
    </DemoStage>
  )
}
