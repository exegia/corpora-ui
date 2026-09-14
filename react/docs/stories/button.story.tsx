import { defineStory } from "@/registry/story"

import { Button } from "../../components/ui/button"

export const story = defineStory({
  Component: Button,
  args: {
    initial: {
      children: "Button",
      variant: "default",
      size: "default",
    },
  },
})
