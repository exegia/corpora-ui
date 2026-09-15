"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Checkbox } from "./checkbox"

type PreviewProps = Pick<
  ComponentProps<typeof Checkbox>,
  "indeterminate" | "disabled" | "sound"
>

function CheckboxPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="">
        <label className="flex items-center gap-2">
          <Checkbox {...props} />
          Include this passage
        </label>
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: CheckboxPreview,
  args: { initial: { indeterminate: false, disabled: false, sound: true } },
})

export const Preview = story.WithControl
