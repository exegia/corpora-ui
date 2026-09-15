"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Reference } from "@/components/atoms/reference"

type PreviewProps = Pick<ComponentProps<typeof Reference>, "href"> & {
  children: string
  preview?: string
}

function ReferencePreview({ children, ...props }: PreviewProps) {
  return (
    <div className="p-6">
      <div className="">
        <Reference {...props} preview="A passage preview from the manuscript.">
          Iliad 1.12
        </Reference>
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
