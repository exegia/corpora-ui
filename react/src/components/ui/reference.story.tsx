import { defineStory } from "@/registry/story"
import { Reference } from "@/components/atoms/reference"

export const story = defineStory({
  Component: Reference,
  args: {
    initial: {
      children: "Iliad 1.12",
      href: "#passage",
      preview: "A passage preview from the manuscript.",
    },
  },
})
