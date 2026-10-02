"use client"

import { Menu, MenuTrigger, MenuPopup, MenuItem } from "@/ui/menu"
import { Button } from "@/components/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Menu>
        <MenuTrigger render={<Button variant="outline" />}>
          Document actions
        </MenuTrigger>
        <MenuPopup>
          <MenuItem>Open source</MenuItem>
          <MenuItem disabled={disabled}>Download text</MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
