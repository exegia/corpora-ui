import { defineStory } from "@/registry/story"
import { Textarea } from "./textarea"

export const story = defineStory({
  Component: Textarea,
  args: {
    initial: { placeholder: "Add an annotation…", disabled: false },
    fixed: { "aria-label": "Annotation" },
  },
})
