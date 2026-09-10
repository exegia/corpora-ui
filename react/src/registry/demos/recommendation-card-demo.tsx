import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Recommendation, RecommendationCard } from "@/components/composed/chat"
import type { RecommendationState } from "@/components/composed/chat"

const GROUP = [
  {
    value: "restock",
    title: "Reorder waffle cones",
    description: "12 cases from",
    entity: { name: "Cone King", initials: "C" },
    leadTime: "7 days",
    confidence: "high",
  },
  {
    value: "vendor",
    title: "Switch vanilla supplier",
    description: "Move the Madagascar SKU to",
    entity: { name: "Bourbon & Co", initials: "B" },
    leadTime: "3 weeks",
    confidence: "medium",
  },
  {
    value: "promo",
    title: "Run a weekend promo",
    description: "Discount pints 15% to clear",
    leadTime: "2 days",
    confidence: "low",
  },
] as const

function GroupDemo(): React.ReactElement {
  const [states, setStates] = React.useState<
    Record<string, RecommendationState>
  >({ vendor: "accepted" })
  const set = (value: string, state: RecommendationState) => () =>
    setStates((prev) => ({ ...prev, [value]: state }))

  return (
    <Recommendation.Group defaultValue={["restock"]}>
      {GROUP.map(({ value, ...item }) => (
        <Recommendation.Item
          key={value}
          value={value}
          state={states[value] ?? "pending"}
          onAccept={set(value, "accepted")}
          onReject={set(value, "rejected")}
          onUndo={set(value, "pending")}
          rejectLabel="Reject"
          {...item}
        />
      ))}
    </Recommendation.Group>
  )
}

export default function RecommendationCardDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex w-full flex-col gap-8 p-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Single card
        </h3>
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
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Recommendation.Group
        </h3>
        <GroupDemo />
      </section>
    </DemoStage>
  )
}
