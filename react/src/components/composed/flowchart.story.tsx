import { defineStory } from "@/registry/story"

import { Flowchart } from "./chat/flowchart"
import Demo from "@/registry/demos/flowchart-demo"

export const story = defineStory({
  Component: Flowchart.Root,
  args: {
    initial: {
      zoomable: true,
      height: 500,
    },
  },
})

export const examples = defineStory({ Component: Demo })
