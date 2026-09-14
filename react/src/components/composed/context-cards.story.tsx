import { defineStory } from "@/registry/story"

import { ContextCards } from "./chat/context-cards"
import Demo from "@/registry/demos/context-cards-demo"

export const story = defineStory({
  Component: ContextCards,
  args: {
    initial: {
      cards: [
        {
          title: "Iliad 1.1",
          meta: "Opening invocation",
          snippet: "Sing, goddess, the anger of Achilles.",
          file: {
            name: "iliad.txt",
            type: "TXT",
          },
        },
      ],
    },
  },
})

export const examples = defineStory({ Component: Demo })
