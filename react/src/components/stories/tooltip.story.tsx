"use client"

import { Tooltip, TooltipTrigger, TooltipPopup } from "@/ui/tooltip"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ description }: { description: string }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Tooltip><TooltipTrigger render={<Button variant="outline" />}>Export</TooltipTrigger><TooltipPopup>{description}</TooltipPopup></Tooltip>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { description: "Download this document" } },
})

export const Preview = story.WithControl
