import { defineStory } from "@/registry/story"

import { Info } from "./user/info"
import Demo from "@/registry/demos/user-demo"

export const story = defineStory({
  Component: Info,
  args: {
    initial: {
      variant: "info",
      user: {
        firstName: "Jenny",
        lastName: "Hamilton",
        role: "Editor",
      },
      description: "Corpus researcher",
    },
  },
})

export const examples = defineStory({ Component: Demo })
