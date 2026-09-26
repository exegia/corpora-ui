"use client"

import { Dialog, DialogTrigger, DialogPopup, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/ui/dialog"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Dialog>
      <DialogTrigger render={<Button />} disabled={disabled}>Open dialog</DialogTrigger>
      <DialogPopup><DialogHeader><DialogTitle>Review import</DialogTitle><DialogDescription>Review the selected documents before continuing.</DialogDescription></DialogHeader>
        <DialogFooter><DialogClose render={<Button variant="outline" />}>Close</DialogClose></DialogFooter>
      </DialogPopup>
    </Dialog>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
