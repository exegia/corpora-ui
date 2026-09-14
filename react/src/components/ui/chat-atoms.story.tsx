import { defineStory } from "@/registry/story"
import { IconTile } from "./chat/icon-tile"
import { FileText } from "lucide-react"

export const story = defineStory({
  Component: IconTile,
  args: {
    initial: { size: 40, tone: "accent" },
    fixed: { children: <FileText aria-hidden="true" /> },
  },
})
