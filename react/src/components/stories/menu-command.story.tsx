"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { MenuCommand } from "@/components/ui/menu-command"
import { Button } from "@/components/ui/button"

type TPreviewProps = Pick<ComponentProps<typeof MenuCommand>, "side" | "align">

function MenuCommandPreview(props: TPreviewProps) {
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
