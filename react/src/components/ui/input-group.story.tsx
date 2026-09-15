"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"

type PreviewProps = Pick<ComponentProps<typeof InputGroup>, "className">

function InputGroupPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-sm">
        <InputGroup {...props}>
          <InputGroupAddon>Corpus</InputGroupAddon>
          <InputGroupInput aria-label="Search corpus" placeholder="Search…" />
        </InputGroup>
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: InputGroupPreview,
  args: { initial: { className: "" } },
})

export const Preview = story.WithControl
