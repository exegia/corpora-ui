"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import {
  InsightCards,
  type IInsight,
} from "@/components/composed/chat/insight-cards"
import type { IStatProps } from "@/components/ui/chat"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof InsightCards>,
    "header" | "index" | "defaultIndex"
  > & {
    insights: (Omit<IInsight, "stats"> & {
      stats?: Pick<IStatProps, "label" | "value" | "delta" | "tone" | "trend">[]
    })[]
  }
>

function InsightCardsPreview(props: TPreviewProps) {
  return <InsightCards {...props} />
}

export const story = defineStory({
  Component: InsightCardsPreview,
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
