import { defineStory } from "@/registry/story"
import { Checkbox } from "./checkbox"

export const story = defineStory({
  Component: Checkbox,
  args: {
    initial: {
      defaultChecked: false,
      indeterminate: false,
      disabled: false,
      sound: true,
    },
    fixed: { "aria-label": "Include this passage" },
  },
})
