"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { Chart } from "@/components/composed/chat/chart"
import { wordOccurrences } from "@/registry/demos/corpus-chart-data"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof Chart>,
    | "type"
    | "title"
    | "subtitle"
    | "badge"
    | "reference"
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
      title: "Word occurrences by book",
      subtitle: "Illustrative counts · selected Bible books",
      reference: {
        children: "Strong’s G26",
        preview:
          "Matched tokens grouped by Strong’s entry and Bible book. These counts are illustrative.",
      },
      headerless: false,
      plotHeight: 244,
      data: wordOccurrences,
      series: [
        {
          key: "occurrences",
          label: "Occurrences",
        },
      ],
    },
  },
})

export const Preview = story.WithControl
