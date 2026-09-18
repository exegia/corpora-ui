"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Reference } from "@/components/atoms/reference"

type TPreviewProps = Pick<ComponentProps<typeof Reference>, "href"> & {
  children: string
  preview?: string
}

function ReferencePreview({ children, ...props }: TPreviewProps) {
  return (
    <div className="p-6">
      <div className="">
        <Reference {...props}>{children}</Reference>
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: ReferencePreview,
  args: {
    initial: {
      href: "#passage",
      children: "Iliad 1.12",
      preview: "A passage preview from the manuscript.",
    },
  },
})

export const Preview = story.WithControl
