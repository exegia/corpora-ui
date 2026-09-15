"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Field, FieldLabel, FieldDescription, FieldError } from "./field"
import { Input } from "./input"

type PreviewProps = Pick<ComponentProps<typeof Field>, "disabled" | "invalid">

function FieldPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-sm">
        <Field {...props}>
          <FieldLabel>Manuscript title</FieldLabel>
          <Input placeholder="Enter a title" />
          <FieldDescription>The title shown in your corpus.</FieldDescription>
          <FieldError match={Boolean(props.invalid)}>
            Enter a manuscript title.
          </FieldError>
        </Field>
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: FieldPreview,
  args: { initial: { disabled: false, invalid: false } },
})

export const Preview = story.WithControl
