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
    | "width"
    | "height"
    | "variant"
    | "interactive"
    | "loading"
    | "showLegend"
    | "animation"
    | "renderer"
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
      variant: "default",
      interactive: true,
      loading: false,
      showLegend: true,
      animation: true,
      renderer: "canvas",
      title: "Word occurrences by book",
      subtitle: "Illustrative counts · selected Bible books",
      reference: {
        children: "Strong’s G26",
        preview:
          "Matched tokens grouped by Strong’s entry and Bible book. These counts are illustrative.",
      },
      headerless: false,
      width: "100%",
      height: 360,
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
