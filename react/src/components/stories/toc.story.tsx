"use client"

import { TOC as Toc } from "@/components/composed/navigation"
import { defineStory } from "@/registry/story"
import { items } from "../composed/navigation/constants"

function ComponentPreview() {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Toc.Canonical items={items}>
              
      </Toc.Canonical>
    </div>
  )
}

export const story = defineStory({
    Component: ComponentPreview,
    centered: false,
})

export const Preview = story.WithControl
