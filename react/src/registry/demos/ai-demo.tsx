import * as React from "react"

import {
  AppliedCard,
  Composer,
  GeneratedBlock,
  StaleCard,
  SuggestedFixCard,
  UserMessage,
  type DiffRow,
} from "@/components/composed/ai"
import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"

const DIFF: DiffRow[] = [
  { type: "remove", field: "label", value: "paragraph" },
  { type: "add", field: "label", value: "p" },
]

export default function AiDemo(): React.ReactElement {
  const [streaming, setStreaming] = React.useState(false)
  const [applied, setApplied] = React.useState(false)

  return (
    <DemoStage
      controls={
        <DemoToggle
          checked={streaming}
          label="streaming"
          onChange={setStreaming}
        />
      }
    >
      <div className="mx-auto grid w-full max-w-sm gap-4">
        <UserMessage>Validate this passage against the schema.</UserMessage>
        <GeneratedBlock
          citations={["p-17", "p-18", "RC-BOUNDARY-02"]}
          content="The paragraph boundary is valid. Node p-17 has a label mismatch."
          isStreaming={streaming}
          onStop={() => setStreaming(false)}
        />
        {!applied ? (
          <SuggestedFixCard
            nodeId="p-17"
            onApply={() => setApplied(true)}
            rationale="The canonical paragraph label is required by the schema."
            rows={DIFF}
            version="3.4"
          />
        ) : (
          <AppliedCard onUndo={() => setApplied(false)} version="3.5" />
        )}
        <StaleCard
          nodeId="p-18"
          onRevalidate={() => {}}
          versionDelta="from v3.3 to v3.4"
        />
        <Composer onSend={() => {}} />
      </div>
    </DemoStage>
  )
}
