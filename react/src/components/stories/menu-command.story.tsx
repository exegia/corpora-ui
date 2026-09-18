"use client"

import { defineStory } from "@/registry/story"
import { MenuCommand } from "@/components/ui/menu-command"
import { Button } from "@/components/ui/button"

export const story = defineStory({
  Component: MenuCommand,
  args: {
    initial: {
      children: <Button variant="outline">Corpus actions</Button>, items: [
        {
          id: "search",
          label: "Search corpus",
          description: "Find a passage",
          trailing: "Connected",
        },
      ],
    },
  },
})

export const Preview = story.WithControl
