import { defineStory } from "@/registry/story"

import { Chart } from "./chat/chart"
import Demo from "@/registry/demos/chart-demo"

export const story = defineStory({
  Component: Chart,
  args: {
    initial: {
      type: "bar",
      title: "Corpus coverage",
      data: [
        {
          label: "Iliad",
          tokens: 79,
        },
        {
          label: "Odyssey",
          tokens: 72,
        },
      ],
      series: [
        {
          key: "tokens",
          label: "Coverage",
        },
      ],
    },
  },
})

export const examples = defineStory({ Component: Demo })
