import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { FilterTable } from "@/components/composed/chat"

type Row = { id: string; task: string; date: string; status: string; advisor: string }

const ROWS: Row[] = [
  { id: "1", task: "Restock mango sorbet", date: "Dec 03", status: "todo", advisor: "Mango Moon" },
  { id: "2", task: "Churn black sesame", date: "Sep 22", status: "progress", advisor: "Kumo Creamery" },
  { id: "3", task: "Print summer menu", date: "Jan 02", status: "todo", advisor: "Coral Coast" },
  { id: "4", task: "Taste-test batch 42", date: "Nov 08", status: "progress", advisor: "Maple Orbit" },
  { id: "5", task: "Order waffle cones", date: "Apr 14", status: "done", advisor: "Aurora Scoops" },
]

export default function FilterTableDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <FilterTable<Row>
        tableId="demo"
        statuses={[
          { id: "todo", label: "To do", tone: "warning" },
          { id: "progress", label: "In progress", tone: "info" },
          { id: "done", label: "Completed", tone: "success" },
        ]}
        columns={[
          { key: "task", header: "Task name" },
          { key: "date", header: "Date" },
          { key: "status", header: "Status" },
          { key: "advisor", header: "Advisor" },
        ]}
        rows={ROWS}
      />
    </DemoStage>
  )
}
