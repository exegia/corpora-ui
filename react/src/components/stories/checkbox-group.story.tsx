"use client"

import { CheckboxGroup } from "@/ui/checkbox-group"
import { Checkbox } from "@/ui/checkbox"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <CheckboxGroup defaultValue={["text"]} disabled={disabled} aria-label="Export contents">
      <label className="flex items-center gap-2"><Checkbox value="text" />Text</label>
      <label className="flex items-center gap-2"><Checkbox value="notes" />Annotations</label>
    </CheckboxGroup>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
