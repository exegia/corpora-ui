import { defineStory } from "@/registry/story"

import { Logo } from "./logo"
import Demo from "@/registry/demos/logo-demo"

export const story = defineStory({
  Component: Logo,
  args: {
    initial: {
      name: "Corpora",
      variant: "full",
    },
  },
})

export const examples = defineStory({ Component: Demo })
