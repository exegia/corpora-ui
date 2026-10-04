"use client"

import { toastManager } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ title }: { title: string }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Button
        onClick={() =>
          toastManager.add({
            title,
            description: "Your changes are available in the library.",
            type: "success",
          })
        }
      >
        Show toast
      </Button>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { title: "Document saved" } },
})

export const Preview = story.WithControl
