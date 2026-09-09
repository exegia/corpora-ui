"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Bubble } from "@/components/atoms"
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
  /** Replaces the spark mark. */
  avatar?: React.ReactNode
  content: AiBubbleContent
}

/**
 * Agent reply: the `ai` Bubble atom with its header, then one content card
 * (Markdown, Research answer, Chart or Streaming text) indented under it.
 *
 * @sketch "Block / AI Bubble / {Markdown, Research Answer, Chart, Streaming}"
 */
export function AiBubble({ name = "Exegia", time, badge = "Agent", avatar, content, className, ...props }: AiBubbleProps): React.ReactElement {
  return (
    <Bubble variant="ai" data-slot="ai-bubble" data-content={content.kind} className={cn("my-0", className)} {...props}>
      <Bubble.Header name={name} time={time} badge={badge} avatar={avatar} />
      <Bubble.Message className="pl-10">
        <AiBubbleBody content={content} />
      </Bubble.Message>
    </Bubble>
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
