import { defineStory } from "@/registry/story"

import { StreamingText } from "./ai/streaming-text"
import Demo from "@/registry/demos/streaming-text-demo"

export const story = defineStory({
  Component: StreamingText,
  args: {
    initial: {
      paragraphs: ["The Iliad opens with an invocation to the Muse."],
      streaming: true,
    },
  },
})

export const examples = defineStory({ Component: Demo })
