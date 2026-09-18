"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { ResearchAnswer } from "@/components/composed/ai/research-answer"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof ResearchAnswer>,
    "kicker" | "kickerSub" | "content" | "source" | "authors" | "date" | "bare"
  >
>

function ResearchAnswerPreview(props: TPreviewProps) {
  return <ResearchAnswer {...props} />
}

export const story = defineStory({
  Component: ResearchAnswerPreview,
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
