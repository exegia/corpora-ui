"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Separator } from "./separator"

type PreviewProps = Pick<ComponentProps<typeof Separator>, "orientation">

function SeparatorPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-sm">
        <div
          className={
            props.orientation === "vertical"
              ? "flex h-20 items-center gap-4"
              : "flex flex-col gap-4"
          }
        >
          <span>Manuscript</span>
          <Separator {...props} />
          <span>Annotations</span>
        </div>
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: SeparatorPreview,
  args: { initial: { orientation: "horizontal" } },
})

export const Preview = story.WithControl
