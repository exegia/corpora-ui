"use client"

import { defineStory } from "@/registry/story"

import { ResearchAnswer } from "@/components/composed/ai/research-answer"

export const story = defineStory({
  Component: ResearchAnswer,
  args: {
    initial: {
      content: "Homeric verse uses repeated formulas to fit the meter.",
      source: "Iliad · Homer corpus",
      authors: "Homer",
      date: "c. 750 BCE",
      bare: false,
    },
  },
})

export const Preview = story.WithControl
