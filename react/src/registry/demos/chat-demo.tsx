"use client"

import * as React from "react"

import {
  AiPanel,
  ApplyToast,
  RecommendationStack,
  type IAiScope,
  type IDiffRow,
} from "@/components/blocks/chat"
import {
  RecommendationCard,
  type TRecommendationState,
} from "@/components/composed/chat"
import { BlockDemoStage as DemoStage } from "@/components/docs/block-demo-stage"
import { cn } from "@/lib/utils"
import AI from "@/components/composed/ai"
import User from "@/components/composed/user"
import { Bubble } from "@/components/atoms"

const SCOPE: IAiScope = {
  kind: "passage",
  label: "a.1",
  range: "¶1–¶2",
  nodeIds: ["p-17", "p-18"],
}

const DIFF: IDiffRow[] = [
  { type: "remove", field: "label", value: "paragraph" },
  { type: "add", field: "label", value: "p" },
]

function DiffRows({ rows }: { rows: IDiffRow[] }): React.ReactElement {
  return (
    <div className="mt-2 gap-1.5 p-2.5 font-mono text-xs grid">
      {rows.map((row, index) => (
        <div
          className={cn(
            "gap-2 rounded px-1.5 py-1 flex",
            row.type === "add"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
              : "bg-red-500/10 text-red-700 dark:text-red-200"
          )}
          key={`${row.type}-${row.field ?? ""}-${index}`}
        >
          <span aria-hidden="true" className="w-3 font-semibold shrink-0">
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
  const [state, setState] = React.useState<TRecommendationState>("pending")
  const runTimer = React.useRef<ReturnType<typeof setTimeout>>(null)

  // Approve → the agent "works" for a beat → applied.
  const approve = (): void => {
    setState("running")
    runTimer.current = setTimeout(() => setState("accepted"), 1600)
  }
  const reset = (next: TRecommendationState) => (): void => {
    if (runTimer.current) clearTimeout(runTimer.current)
    setState(next)
  }
  React.useEffect(
    () => () => {
      if (runTimer.current) clearTimeout(runTimer.current)
    },
    []
  )

  const renderRecommendations = () => {
    return (
      <RecommendationStack>
        <RecommendationCard
          acceptLabel="Apply fix"
          confidence="high"
          description="Change label from paragraph to p on"
          entity={{ name: "p-17", initials: "P" }}
          onAccept={approve}
          onReject={reset("rejected")}
          onUndo={reset("pending")}
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
    )
  }

  return (
    <DemoStage controls={null}>
      <div className="mx-auto h-[42rem] w-full max-w-[28rem] overflow-hidden rounded-sm border bg-background">
        <AiPanel
          scope={SCOPE}
          thread={
            <>
              <Bubble variant="sender">
                <Bubble.Header>
                  <User.Info
                    direction="sender"
                    user={{
                      firstName: "Jenny",
                      lastName: "Hamilton",
                      role: "Editor",
                    }}
                    variant="info"
                  />
                </Bubble.Header>
                <Bubble.Message>
                  Validate this passage against the schema.
                </Bubble.Message>
              </Bubble>
              <Bubble variant="recipient">
                <Bubble.Header>
                  <User.Info
                    direction="recipient"
                    user={{
                      firstName: "Marcus",
                      lastName: "Lee",
                      role: "Reviewer",
                    }}
                    variant="info"
                  />
                </Bubble.Header>
                <Bubble.Message>
                  I’ll compare ¶12 with the latest corpus build.
                </Bubble.Message>
              </Bubble>
              <AI.Message
                AttachedContent={renderRecommendations}
                type="recommendation"
              >
                The paragraph boundary is valid. Node p-17 has a label mismatch.
              </AI.Message>
            </>
          }
          toast={
            state === "accepted" ? (
              <ApplyToast onUndo={reset("pending")} />
            ) : null
          }
        />
      </div>
    </DemoStage>
  )
}
