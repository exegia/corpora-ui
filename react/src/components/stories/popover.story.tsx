"use client"

import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "@/ui/popover"
import { Button } from "@/components/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ title }: { title: string }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>
          Source information
        </PopoverTrigger>
        <PopoverPopup>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>
            Includes bibliographic details and editorial notes.
          </PopoverDescription>
          <PopoverClose render={<Button variant="ghost" />}>Close</PopoverClose>
        </PopoverPopup>
      </Popover>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { title: "Source information" } },
})

export const Preview = story.WithControl
