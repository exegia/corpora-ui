"use client"

import { TableOfContent } from "@/components/composed/navigation"
import { defineStory } from "@/registry/story"
import { items } from "../composed/navigation/constants"

function ComponentPreview() {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <TableOfContent items={items} />
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview
})

export const Preview = story
