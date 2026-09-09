"use client"

import { Sparkles } from "lucide-react"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { AgentBadge, IconTile } from "@/components/ui/chat"
import {
  Chart, Markdown, ResearchAnswer, StreamingText,
  type ChartProps, type MarkdownProps, type ResearchAnswerProps, type StreamingTextProps,
} from "@/components/composed/chat"

export type AiBubbleContent =
  | ({ kind: "markdown" } & MarkdownProps)
  | ({ kind: "research" } & ResearchAnswerProps)
  | ({ kind: "chart" } & ChartProps)
  | ({ kind: "streaming" } & StreamingTextProps)

export interface AiBubbleProps extends Omit<React.ComponentPropsWithoutRef<"div">, "content"> {
  name?: React.ReactNode
  time?: React.ReactNode
  badge?: React.ReactNode
  /** Replaces the sparkles tile. */
  avatar?: React.ReactNode
  content: AiBubbleContent
}

/**
 * Agent reply: sparkles tile · name · Agent badge · time, then the content
 * card indented under the header.
 *
 * @sketch "Block / AI Bubble / {Markdown, Research Answer, Chart, Streaming}"
 */
export function AiBubble({ name = "Exegia", time, badge = "Agent", avatar, content, className, ...props }: AiBubbleProps): React.ReactElement {
  return (
    <div data-slot="ai-bubble" data-content={content.kind} className={cn("flex w-fit max-w-full flex-col gap-2", className)} {...props}>
      <div className="flex items-start gap-2">
        {avatar ?? <IconTile size={32} tone="accent"><Sparkles /></IconTile>}
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="text-[13px] font-semibold leading-4 text-text-primary">{name}</span>
            {badge ? <AgentBadge>{badge}</AgentBadge> : null}
          </span>
          {time ? <span className="text-[11px] leading-3 text-text-muted">{time}</span> : null}
        </div>
      </div>
      <div className="pl-10">
        <AiBubbleBody content={content} />
      </div>
    </div>
  )
}

function AiBubbleBody({ content }: { content: AiBubbleContent }): React.ReactElement {
  switch (content.kind) {
    case "markdown": {
      const { kind: _k, ...p } = content
      return <Markdown {...p} />
    }
    case "research": {
      const { kind: _k, ...p } = content
      return <ResearchAnswer {...p} />
    }
    case "chart": {
      const { kind: _k, ...p } = content
      return <Chart {...p} />
    }
    case "streaming": {
      const { kind: _k, ...p } = content
      return <StreamingText {...p} />
    }
  }
}
