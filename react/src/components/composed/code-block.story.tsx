import { defineStory } from "@/registry/story"

import { CodeBlock } from "./chat/code-block"
import Demo from "@/registry/demos/code-block-demo"

export const story = defineStory({
  Component: CodeBlock,
  args: {
    initial: {
      filename: "corpus.ts",
      code: 'const corpus = "Iliad";\nconst book = 1;',
    },
  },
})

export const examples = defineStory({ Component: Demo })
