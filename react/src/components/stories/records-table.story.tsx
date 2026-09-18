"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { RecordsTable } from "@/components/composed/chat/records-table"

type TPreviewProps = TStoryData<
  Pick<ComponentProps<typeof RecordsTable>, "rows" | "headers" | "maxTags">
>

function RecordsTablePreview(props: TPreviewProps) {
  return <RecordsTable {...props} />
}

export const story = defineStory({
  Component: RecordsTablePreview,
  args: {
    initial: {
      rows: [
        {
          id: "1",
          name: "Iliad",
          initial: "I",
          tags: [
            {
              label: "Epic",
            },
          ],
          lastInteraction: "Today",
          strength: "Strong",
        },
        {
          id: "2",
          name: "Odyssey",
          initial: "O",
          tags: [
            {
              label: "Epic",
            },
          ],
          lastInteraction: "Yesterday",
          strength: "Strong",
        },
      ],
      maxTags: 2,
    },
  },
})

export const Preview = story.WithControl
