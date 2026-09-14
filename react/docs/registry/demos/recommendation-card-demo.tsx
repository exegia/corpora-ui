import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Recommendation, RecommendationCard } from "@/components/composed/chat"
import type { RecommendationState } from "@/components/composed/chat"

const GROUP = [
  {
    value: "convert",
    title: "Convert the Homeric Hymns EPUB to Text-Fabric",
    description: "Walk the EPUB into slots and sections under",
    entity: { name: "Homer corpus", initials: "H" },
    leadTime: "~4 min",
    confidence: "high",
  },
  {
    value: "otext",
    title: "Repair the otext section config",
    description: "sectionTypes lists book,chapter but chapter nodes have no",
    entity: { name: "Iliad", initials: "I" },
    descriptionSuffix: "feature",
    leadTime: "~1 min",
    confidence: "medium",
  },
  {
    value: "lemma",
    title: "Backfill lemma on 312 unlinked forms",
    description: "Match variant spellings against the",
    entity: { name: "Hesiod lexicon", initials: "L" },
    leadTime: "~9 min",
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
      {GROUP.map(({ value, ...item }, index) => (
        <Recommendation.Item
          key={value}
          value={value}
          step={index + 1}
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
          title="Want me to validate the Iliad corpus before the walker runs?"
          description="Check otype, oslots and the section features in"
          entity={{ name: "Iliad · Homer corpus", initials: "I" }}
          descriptionSuffix="which takes about"
          leadTime="2 min"
          options={[
            { label: "Reconcile against the source TEI first", status: "Needs review", signal: "medium" },
            { label: "Rebuild the .cfm cache and skip validation", status: "No signal", signal: "low" },
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
