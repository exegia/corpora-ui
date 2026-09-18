"use client"

import { defineStory } from "@/registry/story"

import { RecordsTable } from "@/components/composed/chat/records-table"

export const story = defineStory({
  Component: RecordsTable,
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
