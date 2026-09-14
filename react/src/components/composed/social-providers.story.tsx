import { defineStory } from "@/registry/story"

import { SocialProviders } from "./social-providers"
import Demo from "@/registry/demos/social-providers-demo"

export const story = defineStory({
  Component: SocialProviders,
  args: {
    initial: {
      action: "continue",
      layout: "stack",
    },
  },
})

export const examples = defineStory({ Component: Demo })
