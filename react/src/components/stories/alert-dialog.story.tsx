"use client"

import { AlertDialog, AlertDialogTrigger, AlertDialogPopup, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogClose } from "@/ui/alert-dialog"
import { Button } from "@/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <AlertDialog>
      <AlertDialogTrigger render={<Button />} disabled={disabled}>Open alert dialog</AlertDialogTrigger>
      <AlertDialogPopup><AlertDialogHeader><AlertDialogTitle>Review import</AlertDialogTitle><AlertDialogDescription>Review the selected documents before continuing.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogClose render={<Button variant="outline" />}>Close</AlertDialogClose></AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
