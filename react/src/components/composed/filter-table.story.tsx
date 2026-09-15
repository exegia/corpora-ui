"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { FilterTable } from "./chat/filter-table"

export const story = defineStory({
  Component: FilterTable<{ id: string; status: string; passage: string }> as FC<
    Pick<
      ComponentProps<
        typeof FilterTable<{ id: string; status: string; passage: string }>
      >,
      "statuses" | "columns" | "rows" | "filter" | "allLabel"
    >
  >,
  args: {
    initial: {
      statuses: [
        {
          id: "review",
          label: "Review",
          tone: "warning",
        },
        {
          id: "done",
          label: "Completed",
          tone: "success",
        },
      ],
      columns: [
        {
          key: "passage",
          header: "Passage",
        },
        {
          key: "status",
          header: "Status",
        },
      ],
      rows: [
        {
          id: "1",
          passage: "Iliad 1.1",
          status: "review",
        },
        {
          id: "2",
          passage: "Iliad 1.2",
          status: "done",
        },
      ],
    },
  },
})

export const Preview = story.WithControl
