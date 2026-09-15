"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Input } from "./input"

type PreviewProps = Pick<
  ComponentProps<typeof Input>,
  "placeholder" | "size" | "disabled" | "type" | "readOnly"
> & {
  variant: "default" | "unstyled"
}

function InputPreview({ variant, ...props }: PreviewProps) {
  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-sm">
        <Input
          {...props}
          aria-label="Search the corpus"
          unstyled={variant === "unstyled"}
        />
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: InputPreview,
  args: {
    initial: {
      placeholder: "Search the corpus",
      size: "default",
      disabled: false,
      variant: "default",
      type: "text",
      readOnly: false,
    },
  },
})

export const Preview = story.WithControl
