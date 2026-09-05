import * as React from "react"

import {
  AiMessage,
  AiPanel,
  ApplyToast,
  ReferenceChip,
  SuggestionCard,
  UserMessage,
  type AiScope,
  type DiffRow,
  type SuggestionState,
} from "@/components/blocks/ai-panel"
import { cn } from "@/lib/utils"
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

function DiffRows({ rows }: { rows: DiffRow[] }): React.ReactElement {
  return (
    <div className="mt-2 grid gap-1.5 p-2.5 font-mono text-xs">
      {rows.map((row, index) => (
        <div
          className={cn(
            "flex gap-2 rounded px-1.5 py-1",
            row.type === "add"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
              : "bg-red-500/10 text-red-700 dark:text-red-200"
          )}
          key={`${row.type}-${row.field ?? ""}-${index}`}
        >
          <span aria-hidden="true" className="w-3 shrink-0 font-semibold">
            {row.type === "add" ? "+" : "−"}
          </span>
          {row.type === "add" ? (
            <ins className="no-underline">
              {row.field ? `${row.field}: ` : ""}
              {row.value}
            </ins>
          ) : (
            <del>
              {row.field ? `${row.field}: ` : ""}
              {row.value}
            </del>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * The panel is chrome-less on purpose: in an application it mounts inside a
 * host container such as the shell's right panel, and the host owns opening,
 * closing and the wiring from reader selections. The bordered rail below
 * stands in for that host.
 */
export default function AiPanelDemo(): React.ReactElement {
  const [state, setState] = React.useState<SuggestionState>("pending")

  return (
    <DemoStage controls={null}>
      <div className="mx-auto h-[42rem] w-full max-w-[21rem] overflow-hidden rounded-sm border bg-background">
        <AiPanel
          scope={SCOPE}
          thread={
            <>
              <UserMessage author="Sender" badge="Admin" time="10 min ago">
                Validate this passage against the schema.
              </UserMessage>
              <AiMessage
                author="Exegia"
                defaultSuggestionsOpen
                suggestions={
                  <>
                    <SuggestionCard
                      description="Label mismatch"
                      heading="Suggested fix"
                      key="p-17"
                      nodeId="p-17"
                      onAccept={() => setState("accepted")}
                      onReject={() => setState("rejected")}
                      reference={<ReferenceChip>p-17</ReferenceChip>}
                      state={state}
                    >
                      <DiffRows rows={DIFF} />
                    </SuggestionCard>
                    <SuggestionCard
                      defaultOpen={false}
                      description="Boundary drift"
                      heading="Suggested fix"
                      key="p-18"
                      nodeId="p-18"
                      reference={<ReferenceChip>p-18</ReferenceChip>}
                    >
                      Node p-18 changed from v3.3 to v3.4 — re-validate before
                      applying.
                    </SuggestionCard>
                  </>
                }
                time="2 min ago"
              >
                The paragraph boundary is valid. Node p-17 has a label
                mismatch.
              </AiMessage>
              {state === "accepted" && (
                <ApplyToast onUndo={() => setState("pending")} />
              )}
            </>
          }
        />
      </div>
    </DemoStage>
  )
}
