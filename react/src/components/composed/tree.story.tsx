import { defineStory } from "@/registry/story"

import { Tree } from "./tree"
import Demo from "@/registry/demos/tree-demo"

export const story = defineStory({
  Component: Tree,
  args: {
    initial: {
      variant: "navigation",
      items: [
        {
          id: "corpora",
          label: "Corpora",
          children: [
            {
              id: "iliad",
              label: "Iliad",
            },
            {
              id: "odyssey",
              label: "Odyssey",
            },
          ],
        },
      ],
    },
  },
})

export const examples = defineStory({ Component: Demo })
