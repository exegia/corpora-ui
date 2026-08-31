import * as React from "react"

import {
  AiPanel,
  AppliedCard,
  ApplyToast,
  GeneratedBlock,
  StaleCard,
  SuggestedFixCard,
  UserMessage,
  type AiScope,
  type DiffRow,
} from "@/components/blocks/ai-panel"
import { DemoStage } from "@/components/docs/demo-controls"

const SCOPE: AiScope = {
  kind: "passage",
  label: "a.1",
  range: "¶1–¶2",
  nodeIds: ["p-17", "p-18"],
}

const DIFF: DiffRow[] = [
  { type: "remove", field: "label", value: "paragraph" },
  { type: "add", field: "label", value: "p" },
]

/**
 * The panel is chrome-less on purpose: in an application it mounts inside a
 * host container such as the shell's right panel, and the host owns opening,
 * closing and the wiring from reader selections. The bordered rail below
 * stands in for that host.
 */
export default function AiPanelDemo(): React.ReactElement {
  const [applied, setApplied] = React.useState(false)

  return (
    <DemoStage controls={null}>
      <div className="mx-auto h-[42rem] w-full max-w-[21rem] overflow-hidden rounded-sm border bg-background">
        <AiPanel
          scope={SCOPE}
          thread={
            <>
              <UserMessage>
                Validate this passage against the schema.
              </UserMessage>
              <GeneratedBlock
                citations={["p-17", "p-18", "RC-BOUNDARY-02"]}
                content="The paragraph boundary is valid. Node p-17 has a label mismatch."
              />
              {!applied ? (
                <>
                  <SuggestedFixCard
                    nodeId="p-17"
                    onApply={() => setApplied(true)}
                    rationale="The canonical paragraph label is required by the schema."
                    rows={DIFF}
                    version="3.4"
                  />
                  <StaleCard
                    nodeId="p-18"
                    onRevalidate={() => {}}
                    versionDelta="from v3.3 to v3.4"
                  />
                </>
              ) : (
                <>
                  <AppliedCard onUndo={() => setApplied(false)} version="3.5" />
                  <ApplyToast onUndo={() => setApplied(false)} />
                </>
              )}
            </>
          }
        />
      </div>
    </DemoStage>
  )
}
