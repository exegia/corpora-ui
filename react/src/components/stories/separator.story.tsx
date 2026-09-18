"use client"

import type { ComponentProps } from "react"
import { Separator } from "@/components/ui/separator"
import { defineStory } from "@/registry/story"

type TPreviewProps = Pick<
  ComponentProps<typeof Separator>,
  "orientation" | "className"
>

function SeparatorPreview({
  orientation = "horizontal",
  ...props
}: TPreviewProps) {
  return orientation === "vertical" ? (
    <div className="h-8 gap-3 text-sm flex items-center">
      <span>Read</span>
      <Separator {...props} orientation={orientation} />
      <span>Annotate</span>
    </div>
  ) : (
    <div className="max-w-64 gap-3 text-sm flex w-full flex-col">
      <span>Manuscripts</span>
      <Separator {...props} orientation={orientation} />
      <span>Codices</span>
    </div>
  )
}

export const story = defineStory({
  Component: SeparatorPreview,
  centered: true,
  args: { initial: { orientation: "horizontal" } },
})

export const Preview = story.WithControl
