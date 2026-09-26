"use client"

import { Badge } from "@/ui/badge"

import { defineStory } from "@/registry/story"

function ComponentPreview({ variant }: { variant: "default" | "outline" | "secondary" | "success" }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Badge variant={variant}>Published</Badge>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { variant: "success" } },
})

export const Preview = story.WithControl
