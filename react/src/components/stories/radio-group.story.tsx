"use client"

import { RadioGroup, Radio } from "@/ui/radio-group"

import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <RadioGroup defaultValue="text" disabled={disabled} aria-label="Export format"><label className="flex items-center gap-2"><Radio value="text" />Plain text</label><label className="flex items-center gap-2"><Radio value="json" />JSON</label></RadioGroup>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
