import { defineStory } from "@/registry/story"
import { MenuCommand } from "./menu-command"
import { Button } from "./button"

export const story = defineStory({
  Component: MenuCommand,
  args: {
    initial: {
      items: [],
      children: <Button variant="outline">Corpus actions</Button>,
      side: "top",
      align: "start",
    },
    fixed: {
      items: [
        {
          id: "search",
          label: "Search corpus",
          description: "Find a passage",
          trailing: "Connected",
        },
      ],
      children: <Button variant="outline">Corpus actions</Button>,
    },
  },
})
