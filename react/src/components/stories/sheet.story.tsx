"use client"

import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/ui/sheet"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Sheet>
      <SheetTrigger render={<Button />} disabled={disabled}>Open sheet</SheetTrigger>
      <SheetContent><SheetHeader><SheetTitle>Review import</SheetTitle><SheetDescription>Review the selected documents before continuing.</SheetDescription></SheetHeader>
        <SheetFooter><SheetClose render={<Button variant="outline" />}>Close</SheetClose></SheetFooter>
      </SheetContent>
    </Sheet>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
