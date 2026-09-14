import { defineStory } from "@/registry/story"
import { Label } from "./label"

export const story = defineStory({
  Component: Label,
  args: {
    initial: { children: "Manuscript title", sound: false },
  },
})
