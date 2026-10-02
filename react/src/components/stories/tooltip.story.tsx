"use client"

import { Tooltip, TooltipTrigger, TooltipPopup } from "@/ui/tooltip"
import { Button } from "@/components/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ description }: { description: string }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>
          Export
        </TooltipTrigger>
        <TooltipPopup>{description}</TooltipPopup>
      </Tooltip>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { description: "Download this document" } },
})

export const Preview = story.WithControl
