"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Bubble, type UserType } from "@/components/atoms"
import User, { type UserInfoProps } from "@/components/composed/user"
import {
  Chart,
  Markdown,
  ResearchAnswer,
  StreamingText,
  type ChartProps,
  type MarkdownProps,
  type ResearchAnswerProps,
  type StreamingTextProps,
} from "@/components/composed/chat"

export type AiBubbleContent =
  | ({ kind: "markdown" } & MarkdownProps)
  | ({ kind: "research" } & ResearchAnswerProps)
  | ({ kind: "chart" } & ChartProps)
  | ({ kind: "streaming" } & StreamingTextProps)

export interface AiBubbleProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "content"
> {
  /** Identity shown in the header. */
  user?: UserType
  time?: React.ReactNode
  /** Replaces the default `User.Info` identity row in the header. */
  UserInfo?: React.FC<UserInfoProps>
  content: AiBubbleContent
}

/**
 * Agent reply: the `ai` Bubble atom with its header, then one content card
 * (Markdown, Research answer, Chart or Streaming text) indented under it.
 *
 * @sketch "Block / AI Bubble / {Markdown, Research Answer, Chart, Streaming}"
 */
export function AiBubble({
  user = { firstName: "Exegia", role: "Agent" },
  time,
  UserInfo = User.Info,
  content,
  className,
  ...props
}: AiBubbleProps): React.ReactElement {
  return (
    <Bubble
      variant="ai"
      data-slot="ai-bubble"
      data-content={content.kind}
      className={cn("my-0", className)}
      {...props}
    >
      <Bubble.Header time={time} user={user} UserInfo={UserInfo} />
      <Bubble.Message className="pl-10">
        <AiBubbleBody content={content} />
      </Bubble.Message>
    </Bubble>
  )
}

function AiBubbleBody({
  content,
}: {
  content: AiBubbleContent
}): React.ReactElement {
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
