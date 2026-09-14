import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { ContextCards } from "@/components/composed/chat"

export default function ContextCardsDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <ContextCards
        count={32}
        cards={[
          { title: "Vendor onboarding rule", meta: "290 characters", snippet: "Cold-chain certification must be verified before a new dairy can be added to the approved supplier list.", file: { name: "Dairy Onboarding SOP.pdf", type: "PDF" } },
          { title: "Seasonal demand row", meta: "1,250 characters", snippet: "Q4 velocity table: pistachio +18%, vanilla +6%, rocky road -11%; retire rocky road by March.", file: { name: "Sales Velocity Export.csv", type: "CSV" } },
        ]}
      />
    </DemoStage>
  )
}
