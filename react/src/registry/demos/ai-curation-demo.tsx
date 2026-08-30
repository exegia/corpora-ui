import * as React from "react"

import {
  AiPanel,
  AppliedCard,
  AppliedMark,
  ApplyToast,
  GeneratedBlock,
  ScopeChip,
  SelectionHighlight,
  SelectionPopover,
  StaleCard,
  SuggestedFixCard,
  UserMessage,
  type AiScope,
  type DiffRow,
} from "@/components/blocks/ai-curation"
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

export default function AiCurationDemo(): React.ReactElement {
  const [popover, setPopover] = React.useState(true)
  const [applied, setApplied] = React.useState(false)

  return (
    <DemoStage controls={null}>
      <div className="relative min-h-[48rem] overflow-hidden rounded-xl bg-[#10100f] text-white">
        <div className="flex min-h-[48rem] flex-col gap-5 p-6 pr-[22rem]">
          <div className="text-sm leading-7 text-white/75">
            <SelectionPopover
              node={{
                range: "a.1 ¶1–¶2",
                nodeIds: ["p-17", "p-18"],
                wordCount: 24,
              }}
              onAddToChat={() => setPopover(false)}
              onOpenChange={setPopover}
              open={popover}
              variant="node"
            >
              <SelectionHighlight range="¶1–¶2">
                <span>
                  Q.1 a.1 — The selected passage is ready for curation.
                </span>
              </SelectionHighlight>
            </SelectionPopover>
          </div>
          <AiPanel
            className="absolute inset-y-0 right-0 max-w-[21rem] rounded-none border-y-0 border-r-0"
            onClose={() => {}}
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
                    <AppliedCard
                      onUndo={() => setApplied(false)}
                      version="3.5"
                    />
                    <ApplyToast onUndo={() => setApplied(false)} />
                  </>
                )}
              </>
            }
          />
          <div className="text-sm text-white/65">
            {applied ? (
              <AppliedMark nodeId="p-17">p — canonical paragraph</AppliedMark>
            ) : (
              "Reader content remains unchanged until Apply."
            )}
          </div>
          <ScopeChip scope={SCOPE} />
        </div>
      </div>
    </DemoStage>
  )
}
