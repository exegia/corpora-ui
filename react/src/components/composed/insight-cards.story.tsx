"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { InsightCards } from "./chat/insight-cards"

export const story = defineStory({
  Component: InsightCards as FC<
    Pick<ComponentProps<typeof InsightCards>, "insights" | "header" | "index">
  >,
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

export const Preview = story.WithControl
