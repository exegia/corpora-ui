import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { RecommendationCard } from "@/components/composed/chat"

export default function RecommendationCardDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <RecommendationCard
        title="Want me to place this restock order?"
        description="Reorder waffle cones from"
        entity={{ name: "Cone King", initials: "C" }}
        descriptionSuffix="with lead time"
        leadTime="7 days"
        options={[
          { label: "Switch to Vanilla Madagascar", status: "Needs review", signal: "medium" },
          { label: "Full restock across every SKU", status: "No signal", signal: "low" },
        ]}
        confidence="high"
      />
    </DemoStage>
  )
}
