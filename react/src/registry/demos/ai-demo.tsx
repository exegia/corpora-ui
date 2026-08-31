import * as React from "react"

import {
  Composer,
  GeneratedBlock,
  SuggestionCard,
  UserMessage,
  type DiffRow,
} from "@/components/composed/ai"
import { cn } from "@/lib/utils"
import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"

const DIFF: DiffRow[] = [
  { type: "remove", field: "label", value: "paragraph" },
  { type: "add", field: "label", value: "p" },
]

function DiffRows({ rows }: { rows: DiffRow[] }): React.ReactElement {
  return (
    <div className="grid gap-1.5 rounded-sm border bg-muted/40 p-2.5 font-mono text-xs">
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

export default function AiDemo(): React.ReactElement {
  const [streaming, setStreaming] = React.useState(false)
  const [state, setState] = React.useState<"pending" | "accepted" | "rejected">(
    "pending"
  )

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
        <SuggestionCard
          description="Label mismatch"
          nodeId="p-17"
          onAccept={() => setState("accepted")}
          onReject={() => setState("rejected")}
          state={state}
          heading="Suggested fix"
        >
          <div className="mt-2 grid gap-2">
            <DiffRows rows={DIFF} />
            <p className="text-[13px] leading-5 text-muted-foreground">
              The canonical paragraph label is required by the schema.
            </p>
          </div>
        </SuggestionCard>
        <Composer onSend={() => {}} />
      </div>
    </DemoStage>
  )
}
