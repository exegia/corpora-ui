import * as React from "react"

import {
  AiMessage,
  AiPanel,
  ApplyToast,
  RecommendationStack,
  UserMessage,
  type AiScope,
  type DiffRow,
} from "@/components/blocks/ai-panel"
import {
  RecommendationCard,
  type RecommendationState,
} from "@/components/composed/chat"
import { DemoStage } from "@/components/docs/demo-controls"
import { cn } from "@/lib/utils"

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
  const [state, setState] = React.useState<RecommendationState>("pending")

  return (
    <DemoStage controls={null}>
      <div className="mx-auto h-[42rem] w-full max-w-[28rem] overflow-hidden rounded-sm border bg-background">
        <AiPanel
          scope={SCOPE}
          thread={
            <>
              <UserMessage author="Sender" badge="Admin" time="10 min ago">
                Validate this passage against the schema.
              </UserMessage>
              <AiMessage author="Exegia" time="2 min ago">
                The paragraph boundary is valid. Node p-17 has a label mismatch.
              </AiMessage>
              <RecommendationStack>
                <RecommendationCard
                  acceptLabel="Apply fix"
                  confidence="high"
                  description="Change label from paragraph to p on"
                  entity={{ name: "p-17", initials: "P" }}
                  onAccept={() => setState("accepted")}
                  onReject={() => setState("rejected")}
                  onUndo={() => setState("pending")}
                  rejectLabel="Ignore"
                  state={state}
                  title="Fix the label mismatch"
                >
                  <DiffRows rows={DIFF} />
                </RecommendationCard>
                <RecommendationCard
                  acceptLabel="Re-validate"
                  confidence="medium"
                  defaultOpen={false}
                  description="Node p-18 changed from v3.3 to v3.4"
                  rejectLabel="Ignore"
                  title="Re-validate the boundary drift"
                >
                  Re-validate this node before applying the corpus update.
                </RecommendationCard>
              </RecommendationStack>
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
