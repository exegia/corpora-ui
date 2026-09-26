"use client"

import { Drawer, DrawerTrigger, DrawerPopup, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/ui/drawer"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Drawer>
      <DrawerTrigger render={<Button />} disabled={disabled}>Open drawer</DrawerTrigger>
      <DrawerPopup><DrawerHeader><DrawerTitle>Review import</DrawerTitle><DrawerDescription>Review the selected documents before continuing.</DrawerDescription></DrawerHeader>
        <DrawerFooter><DrawerClose render={<Button variant="outline" />}>Close</DrawerClose></DrawerFooter>
      </DrawerPopup>
    </Drawer>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
