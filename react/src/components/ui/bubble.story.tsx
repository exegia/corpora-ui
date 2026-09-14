import { defineStory } from "@/registry/story"
import { Bubble } from "@/components/atoms/bubble"

export const story = defineStory({
  Component: Bubble,
  args: {
    initial: { variant: "recipient", continued: false },
    fixed: {
      children: (
        <Bubble.Message>
          Can you check whether this passage keeps the boundary?
        </Bubble.Message>
      ),
    },
  },
})
