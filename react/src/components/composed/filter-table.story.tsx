import { defineStory } from "@/registry/story"

import { FilterTable } from "./chat/filter-table"
import Demo from "@/registry/demos/filter-table-demo"

export const story = defineStory({
  Component: FilterTable<{ id: string; status: string; passage: string }>,
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

export const examples = defineStory({ Component: Demo })
