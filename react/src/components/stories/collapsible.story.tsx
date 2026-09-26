"use client"

import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/ui/collapsible"

import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Collapsible disabled={disabled}><CollapsibleTrigger>Show source details</CollapsibleTrigger><CollapsiblePanel><p className="py-3">The source edition includes editorial notes and a bibliography.</p></CollapsiblePanel></Collapsible>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
