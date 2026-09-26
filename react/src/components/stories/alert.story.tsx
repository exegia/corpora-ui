"use client"

import { Alert, AlertTitle, AlertDescription } from "@/ui/alert"

import { defineStory } from "@/registry/story"

function ComponentPreview({ variant }: { variant: "default" | "info" | "success" | "warning" | "error" }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Alert variant={variant}><AlertTitle>Import complete</AlertTitle><AlertDescription>Your documents are ready to review.</AlertDescription></Alert>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { variant: "success" } },
})

export const Preview = story.WithControl
