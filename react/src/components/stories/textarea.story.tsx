"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Textarea } from "@/components/ui/textarea"

type TPreviewProps = Pick<
  ComponentProps<typeof Textarea>,
  "placeholder" | "disabled" | "readOnly" | "rows"
>

function TextareaPreview(props: TPreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-sm">
        <Textarea {...props} aria-label="Annotation" />
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: TextareaPreview,
  args: {
    initial: {
      placeholder: "Add an annotation…",
      disabled: false,
      readOnly: false,
      rows: 3,
    },
  },
})

export const Preview = story.WithControl
