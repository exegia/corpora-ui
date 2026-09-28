"use client"

import { TableOfContent } from "@/components/composed/navigation"
import { defineStory } from "@/registry/story"

function ComponentPreview({ title }: { title: string }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <TableOfContent />
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { title: "Document saved" } },
})

export const Preview = story.WithControl
