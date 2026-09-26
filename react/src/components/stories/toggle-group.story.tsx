"use client"

import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group"

import { defineStory } from "@/registry/story"

function ComponentPreview({ multiple }: { multiple: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <ToggleGroup multiple={multiple} defaultValue={["bold"]} aria-label="Text formatting"><ToggleGroupItem value="bold">Bold</ToggleGroupItem><ToggleGroupItem value="italic">Italic</ToggleGroupItem></ToggleGroup>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { multiple: true } },
})

export const Preview = story.WithControl
