import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Flowchart, type StepNode } from "@/components/composed/chat"

const PURPLE = "var(--tag-purple-text)"
const AMBER = "var(--tag-amber-text)"

const NODES: StepNode[] = [
  {
    id: "trigger",
    row: 0,
    x: 0.5,
    w: 300,
    kind: { label: "Trigger", hue: PURPLE },
    hue: PURPLE,
    title: "New order created",
    caption: "Trigger when a new order is created",
  },
  {
    id: "cond",
    row: 1,
    x: 0.5,
    w: 356,
    kind: { label: "If / Else", hue: AMBER },
    condition: true,
  },
]

export default function FlowchartDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <Flowchart.Root steps={NODES} />
    </DemoStage>
  )
}
