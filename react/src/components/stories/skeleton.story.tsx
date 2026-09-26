"use client"

import { Skeleton } from "@/ui/skeleton"

import { defineStory } from "@/registry/story"

function ComponentPreview({ wide }: { wide: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <div role="status" aria-label="Loading document" className="space-y-3"><Skeleton className="h-6 w-40" /><Skeleton className={wide ? "h-4 w-72" : "h-4 w-48"} /><Skeleton className="h-4 w-56" /></div>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { wide: true } },
})

export const Preview = story.WithControl
