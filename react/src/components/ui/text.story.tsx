import { defineStory } from "@/registry/story"
import { Text } from "@/components/atoms/text/default"

export const story = defineStory({
  Component: Text,
  args: {
    initial: {
      children: "Readable corpus prose belongs here.",
      type: "paragraph",
      size: "medium",
    },
  },
})
