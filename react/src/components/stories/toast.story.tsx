"use client"

import { toastManager } from "@/ui/toast"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ title }: { title: string }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Button onClick={() => toastManager.add({ title, description: "Your changes are available in the library.", type: "success" })}>Show toast</Button>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { title: "Document saved" } },
})

export const Preview = story.WithControl
