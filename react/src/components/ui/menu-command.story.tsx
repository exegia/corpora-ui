"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { MenuCommand } from "./menu-command"
import { Button } from "./button"

type PreviewProps = Pick<ComponentProps<typeof MenuCommand>, "side" | "align">

function MenuCommandPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="">
        <MenuCommand
          {...props}
          items={[
            {
              id: "search",
              label: "Search corpus",
              description: "Find a passage",
              trailing: "Connected",
            },
          ]}
        >
          <Button variant="outline">Corpus actions</Button>
        </MenuCommand>
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: MenuCommandPreview,
  args: { initial: { side: "top", align: "start" } },
})

export const Preview = story.WithControl
