"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { RecommendationCard } from "./chat/recommendation"

export const story = defineStory({
  Component: RecommendationCard as FC<
    Pick<
      ComponentProps<typeof RecommendationCard>,
      | "title"
      | "description"
      | "confidence"
      | "state"
      | "step"
      | "defaultOpen"
      | "acceptLabel"
      | "rejectLabel"
    >
  >,
  args: {
    initial: {
      title: "Review these lemma links?",
      description: "Resolve ambiguous forms in the Iliad",
      confidence: "high",
    },
  },
})

export const Preview = story.WithControl
