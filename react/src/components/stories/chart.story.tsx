"use client"

import { defineStory } from "@/registry/story"

import { Chart } from "@/components/composed/chat/chart"

export const story = defineStory({
  Component: Chart,
  args: {
    initial: {
      type: "bar",
      title: "Corpus coverage",
      subtitle: "Resolved corpus tokens",
      headerless: false,
      plotHeight: 244,
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

export const Preview = story.WithControl
