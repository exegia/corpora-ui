"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { ResearchAnswer } from "./ai/research-answer"

export const story = defineStory({
  Component: ResearchAnswer as FC<
    Pick<
      ComponentProps<typeof ResearchAnswer>,
      | "content"
      | "kicker"
      | "kickerSub"
      | "source"
      | "date"
      | "authors"
      | "bare"
    >
  >,
  args: {
    initial: {
      content: "Homeric verse uses repeated formulas to fit the meter.",
      source: "Iliad · Homer corpus",
      authors: "Homer",
      date: "c. 750 BCE",
    },
  },
})

export const Preview = story.WithControl
