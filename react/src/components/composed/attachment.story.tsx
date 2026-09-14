import { defineStory } from "@/registry/story"

import { Attachment } from "./chat/attachment"
import Demo from "@/registry/demos/attachment-demo"

export const story = defineStory({
  Component: Attachment,
  args: {
    initial: {
      kind: "document",
      title: "Iliad annotations.pdf",
      meta: "PDF · 2.4 MB",
    },
  },
})

export const examples = defineStory({ Component: Demo })
