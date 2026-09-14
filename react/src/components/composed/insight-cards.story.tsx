import { defineStory } from "@/registry/story"

import { InsightCards } from "./chat/insight-cards"
import Demo from "@/registry/demos/insight-cards-demo"

export const story = defineStory({
  Component: InsightCards,
  args: {
    initial: {
      insights: [
        {
          summary: "Iliad lemma coverage reached 79%.",
          stats: [
            {
              label: "Coverage",
              value: "79%",
              tone: "series-1",
            },
          ],
          followUp: "Which lemmas are unresolved?",
        },
        {
          summary: "14 lemmas need review.",
          allocation: {
            label: "Flagged lemmas",
            value: "14",
            segments: [
              {
                key: "ambiguous",
                label: "Ambiguous",
                value: 8,
              },
              {
                key: "variant",
                label: "Variants",
                value: 6,
              },
            ],
          },
        },
      ],
    },
  },
})

export const examples = defineStory({ Component: Demo })
