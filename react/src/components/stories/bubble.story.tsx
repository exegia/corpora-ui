"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Bubble } from "@/components/atoms/bubble"
import User from "@/components/composed/user"
import AI from "@/components/composed/ai"

type TPreviewProps = Pick<
  ComponentProps<typeof Bubble>,
  "variant" | "continued"
>

function BubblePreview({ variant = "recipient", continued }: TPreviewProps) {
  const message = "Can you check whether this passage keeps the boundary?"
  return (
    <div className="p-6 max-w-lg w-full">
      {variant === "ai" ? (
        <Bubble variant="ai" continued={continued}>
          {!continued && (
            <Bubble.Header>
              <AI.Avatar />
            </Bubble.Header>
          )}
          <Bubble.Message>{message}</Bubble.Message>
        </Bubble>
      ) : (
        <User.Message
          variant="info"
          continued={continued}
          user={{
            firstName: "John",
            lastName: "Doe",
            description: "10 min ago",
            direction: variant,
          }}
          reactions={{
            reactions: [
              {
                id: "heart",
                emoji: "❤️",
                count: 4,
                reacted: true,
                label: "heart",
              },
            ],
          }}
        >
          {message}
        </User.Message>
      )}
    </div>
  )
}

export const story = defineStory({
  Component: BubblePreview,
  args: { initial: { variant: "recipient", continued: false } },
})

export const Preview = story.WithControl
