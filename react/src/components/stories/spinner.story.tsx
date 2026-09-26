"use client"

import { Spinner } from "@/ui/spinner"

import { defineStory } from "@/registry/story"

function ComponentPreview({ large }: { large: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Spinner className={large ? "size-8" : "size-5"} aria-label="Loading documents" />
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { large: false } },
})

export const Preview = story.WithControl
