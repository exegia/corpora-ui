import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Flowchart, type Edge, type FlowchartSide, type StepNode } from "@/components/composed/chat"

const PURPLE = "var(--tag-purple-text)"
const AMBER = "var(--tag-amber-text)"
const BLUE = "var(--tag-blue-text)"

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
  const [steps, setSteps] = React.useState(NODES)
  const [edges, setEdges] = React.useState<Edge[]>([{ id: "trigger->cond", source: "trigger", target: "cond" }])
  const [readOnly, setReadOnly] = React.useState(false)

  const add = (from: string, side: FlowchartSide) => {
    const parent = steps.find((n) => n.id === from)
    if (!parent) return
    const id = `node-${Date.now().toString(36)}`
    const row = side === "top" ? Math.max(0, parent.row - 1) : side === "bottom" ? parent.row + 1 : parent.row
    const x = side === "left" ? Math.max(0.2, parent.x - 0.3) : side === "right" ? Math.min(0.8, parent.x + 0.3) : parent.x
    setSteps((s) => [...s, { id, row, x, w: 240, kind: { label: "Step", hue: BLUE }, hue: BLUE, title: "New step", caption: `Added ${side} of ${parent.title ?? parent.kind?.label}` }])
    setEdges((e) => [...e, side === "top" ? { id: `${id}->${from}`, source: id, target: from } : { id: `${from}->${id}`, source: from, target: id }])
  }
  const remove = (id: string) => {
    setSteps((s) => s.filter((n) => n.id !== id))
    setEdges((e) => e.filter((x) => x.source !== id && x.target !== id))
  }

  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-col gap-3 p-6">
      <label className="flex items-center gap-2 self-end text-[12px] text-text-secondary">
        <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
        Read-only
      </label>
      <Flowchart.Root
        steps={steps}
        edges={edges}
        readOnly={readOnly}
        zoomable
        onAdd={add}
        onRemove={remove}
        onDrag={(id, offset) => console.log("drag", id, offset)}
      />
    </DemoStage>
  )
}
