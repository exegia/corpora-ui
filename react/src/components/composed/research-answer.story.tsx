import { defineStory } from "@/registry/story"

import { ResearchAnswer } from "./ai/research-answer"
import Demo from "@/registry/demos/research-answer-demo"

export const story = defineStory({
  Component: ResearchAnswer,
  args: {
    initial: {
      content: "Homeric verse uses repeated formulas to fit the meter.",
      source: "Iliad · Homer corpus",
      authors: "Homer",
      date: "c. 750 BCE",
    },
  },
})

export const examples = defineStory({ Component: Demo })
