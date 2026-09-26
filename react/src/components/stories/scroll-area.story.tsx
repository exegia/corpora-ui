"use client"

import { ScrollArea } from "@/ui/scroll-area"

import { defineStory } from "@/registry/story"

function ComponentPreview({ count }: { count: number }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <ScrollArea className="h-48 rounded-lg border"><div className="space-y-3 p-4">{Array.from({ length: count }, (_, index) => <p key={index}>Passage {index + 1}</p>)}</div></ScrollArea>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { count: 20 } },
})

export const Preview = story.WithControl
