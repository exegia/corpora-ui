import { defineStory } from "@/registry/story"

import { RecommendationCard } from "./chat/recommendation"
import Demo from "@/registry/demos/recommendation-card-demo"

export const story = defineStory({
  Component: RecommendationCard,
  args: {
    initial: {
      title: "Review these lemma links?",
      description: "Resolve ambiguous forms in the Iliad",
      confidence: "high",
    },
  },
})

export const examples = defineStory({ Component: Demo })
