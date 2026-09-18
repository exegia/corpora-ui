"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { Chart } from "@/components/composed/chat/chart"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof Chart>,
    | "type"
    | "title"
    | "subtitle"
    | "badge"
    | "data"
    | "series"
    | "center"
    | "headerless"
    | "plotHeight"
  >
>

function ChartPreview(props: TPreviewProps) {
  return <Chart {...props} />
}

export const story = defineStory({
  Component: ChartPreview,
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
