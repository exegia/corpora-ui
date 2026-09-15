"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Text } from "@/components/atoms/text/default"

type PreviewProps = Pick<
  ComponentProps<typeof Text>,
  "type" | "size" | "selection"
> & { children: string }

function TextPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <Text {...props} />
    </div>
  )
}

export const story = defineStory({
  Component: TextPreview,
  args: {
    initial: {
      children: "Readable corpus prose belongs here.",
      type: "paragraph",
      size: "medium",
    },
  },
})

export const Preview = story.WithControl
