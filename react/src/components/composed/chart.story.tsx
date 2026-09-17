"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { Chart } from "./chat/chart"

export const story = defineStory({
  Component: Chart as FC<
    Pick<
      ComponentProps<typeof Chart>,
      | "type"
      | "title"
      | "subtitle"
      | "data"
      | "series"
      | "headerless"
      | "plotHeight"
    >
  >,
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
