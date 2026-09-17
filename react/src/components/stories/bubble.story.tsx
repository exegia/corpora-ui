"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Bubble } from "@/components/atoms/bubble"

type PreviewProps = Pick<ComponentProps<typeof Bubble>, "variant" | "continued">

function BubblePreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-lg">
        <Bubble {...props}>
          {!props.continued && (
            <Bubble.Header>
              <span>John Doe</span>
              <span className="text-muted-foreground">10 min ago</span>
            </Bubble.Header>
          )}
          <Bubble.Message>
            Can you check whether this passage keeps the boundary?
          </Bubble.Message>
          <Bubble.Reactions
            reactions={[
              {
                id: "heart",
                emoji: "❤️",
                count: 4,
                reacted: true,
                label: "heart",
              },
            ]}
          />
        </Bubble>
      </div>
    </div>
  )
}

const story = defineStory({
  Component: BubblePreview,
  args: { initial: { variant: "recipient", continued: false } },
})

export const Preview = story.WithControl
