import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Flowchart } from "@/components/composed/chat"

export default function FlowchartDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <Flowchart
        nodes={[
          { kind: "trigger", title: "New order created", description: "Trigger when a new order is created" },
          {
            kind: "condition",
            rows: [
              { parts: ["If", { pill: "order" }, { pill: "flavor" }, "is", { pill: "Rocky Road", accent: true }] },
              { parts: ["and", { pill: "order" }, { pill: "topping" }, "is", { pill: "Brown butter brittle", accent: true }] },
            ],
          },
        ]}
      />
    </DemoStage>
  )
}
