"use client"

import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@/ui/select"

import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Select defaultValue="text" disabled={disabled}><SelectTrigger aria-label="Export format"><SelectValue /></SelectTrigger><SelectPopup><SelectItem value="text">Plain text</SelectItem><SelectItem value="json">JSON</SelectItem></SelectPopup></Select>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
