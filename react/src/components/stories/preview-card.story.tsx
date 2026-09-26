"use client"

import { PreviewCard, PreviewCardTrigger, PreviewCardPopup } from "@/ui/preview-card"

import { defineStory } from "@/registry/story"

function ComponentPreview({ description }: { description: string }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <PreviewCard><PreviewCardTrigger href="/atoms/reference" className="underline">Reference guide</PreviewCardTrigger><PreviewCardPopup>{description}</PreviewCardPopup></PreviewCard>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { description: "Create consistent references for books, chapters, and passages." } },
})

export const Preview = story.WithControl
