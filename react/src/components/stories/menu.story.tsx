"use client"

import { Menu, MenuTrigger, MenuPopup, MenuItem } from "@/ui/menu"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Menu><MenuTrigger render={<Button variant="outline" />}>Document actions</MenuTrigger><MenuPopup><MenuItem>Open source</MenuItem><MenuItem disabled={disabled}>Download text</MenuItem></MenuPopup></Menu>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
