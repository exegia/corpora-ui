import { defineStory } from "@/registry/story"

import { Markdown } from "./chat/markdown"
import Demo from "@/registry/demos/markdown-demo"

export const story = defineStory({
  Component: Markdown,
  args: {
    initial: {
      source:
        "# Corpus notes\n\nThe **Iliad** preserves several formulaic expressions.",
    },
  },
})

export const examples = defineStory({ Component: Demo })
