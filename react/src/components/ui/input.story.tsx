import { defineStory } from "@/registry/story"
import { Input } from "./input"

export const story = defineStory({
  Component: Input,
  args: {
    initial: {
      placeholder: "Search the corpus",
      size: "default",
      disabled: false,
      unstyled: false,
    },
    fixed: { "aria-label": "Search the corpus" },
  },
})
