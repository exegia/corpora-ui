"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { MenuCommand } from "@/components/ui/menu-command"
import { Button } from "@/components/ui/button"

type TPreviewProps = Pick<
  ComponentProps<typeof MenuCommand>,
  "side" | "align"
> & {
  items: {
    id: string
    label: string
    description?: string
    trailing?: string
  }[]
}
function MenuCommandPreview(props: TPreviewProps) {
  return (
    <MenuCommand {...props}>
      <Button variant="outline">Corpus actions</Button>
    </MenuCommand>
  )
}

export const story = defineStory({
  Component: MenuCommandPreview,
  args: {
    initial: {
      items: [
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
