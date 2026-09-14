import { defineStory } from "@/registry/story"
import { Separator } from "./separator"

export const story = defineStory({
  Component: Separator,
  args: {
    initial: { orientation: "horizontal" },
    fixed: {
      style: {
        minWidth: "1px",
        minHeight: "1px",
        width: "100%",
        height: "100%",
      },
    },
  },
})
