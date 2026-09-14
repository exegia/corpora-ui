import { defineStory } from "@/registry/story"

import { Verse } from "./verse"
import Demo from "@/registry/demos/verse-demo"

export const story = defineStory({
  Component: Verse,
  args: {
    initial: {
      chapter: "1:1",
      children: "In the beginning God created the heavens and the earth.",
    },
  },
})

export const examples = defineStory({ Component: Demo })
