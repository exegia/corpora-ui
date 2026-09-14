import { defineStory } from "@/registry/story"

import { RecordsTable } from "./chat/records-table"
import Demo from "@/registry/demos/records-table-demo"

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

export const examples = defineStory({ Component: Demo })
