"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { RecordsTable } from "./chat/records-table"

export const story = defineStory({
  Component: RecordsTable as FC<
    Pick<ComponentProps<typeof RecordsTable>, "rows" | "maxTags">
  >,
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
