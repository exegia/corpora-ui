import { Zap } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Tag } from "@/components/ui/chat"

export interface FlowchartConditionRow {
  /** Alternating words and pills: strings are words, `{ pill }` renders a pill. */
  parts: (string | { pill: React.ReactNode; accent?: boolean })[]
}

export type FlowchartNode =
  | { kind: "trigger"; label?: React.ReactNode; icon?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode }
  | { kind: "condition"; label?: React.ReactNode; rows: FlowchartConditionRow[] }

export interface FlowchartProps extends React.ComponentPropsWithoutRef<"div"> {
  nodes: FlowchartNode[]
}

/**
 * Dot-grid canvas with a vertical chain of Trigger and If/Else nodes.
 *
 * @sketch "Component / Flowchart"
 */
export function Flowchart({ nodes, className, ...props }: FlowchartProps): React.ReactElement {
  return (
    <div
      data-slot="flowchart"
      className={cn(
        "flex w-[480px] max-w-full flex-col rounded-xl border border-border-default bg-surface-canvas p-6 [background-image:radial-gradient(var(--border-default)_1px,transparent_1px)] [background-position:16px_16px] [background-size:24px_24px]",
        className
      )}
      {...props}
    >
      {nodes.map((node, i) => (
        <div key={i} className="flex flex-col">
          {i > 0 ? (
            <div aria-hidden="true" className="flex h-12 flex-col items-center">
              <span className="w-0.5 flex-1 bg-border-default" />
              <span className="size-2 rounded-full bg-text-muted" />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Tag tone={node.kind === "trigger" ? "purple" : "amber"} className="w-fit">{node.label ?? (node.kind === "trigger" ? "Trigger" : "If / Else")}</Tag>
            {node.kind === "trigger" ? (
              <div className="flex w-[300px] max-w-full items-center gap-2.5 rounded-[10px] border border-border-default bg-surface-card p-2.5">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-subtle text-accent-text [&_svg]:size-4">{node.icon ?? <Zap />}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-semibold leading-4 text-text-primary">{node.title}</span>
                  {node.description ? <span className="truncate text-[11px] leading-3 text-text-secondary">{node.description}</span> : null}
                </span>
              </div>
            ) : (
              <div className="flex w-[380px] max-w-full flex-col gap-2.5 rounded-[10px] border border-border-default bg-surface-card px-3 py-3">
                {node.rows.map((row, ri) => (
                  <span key={ri} className="flex flex-wrap items-center gap-1.5 text-[12.5px] leading-none text-text-primary">
                    {row.parts.map((part, pi) =>
                      typeof part === "string" ? (
                        <span key={pi} className="text-text-secondary">{part}</span>
                      ) : (
                        <span key={pi} className={cn("inline-flex h-5 items-center rounded-md border px-2 text-[11.5px] font-medium", part.accent ? "border-tag-amber-border bg-tag-amber-fill text-tag-amber-text" : "border-border-default bg-surface-subtle text-text-primary")}>
                          {part.pill}
                        </span>
                      )
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
