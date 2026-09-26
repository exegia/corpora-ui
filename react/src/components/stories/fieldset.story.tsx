"use client"

import { Fieldset, FieldsetLegend } from "@/ui/fieldset"
import { Checkbox } from "@/ui/checkbox"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Fieldset disabled={disabled}><FieldsetLegend>Notifications</FieldsetLegend><label className="flex items-center gap-2"><Checkbox defaultChecked />Email me about completed imports</label></Fieldset>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
