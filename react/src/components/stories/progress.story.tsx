"use client"

import { Progress, ProgressLabel, ProgressTrack, ProgressIndicator, ProgressValue } from "@/ui/progress"

import { defineStory } from "@/registry/story"

function ComponentPreview({ value }: { value: number }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Progress value={value}><div className="flex justify-between"><ProgressLabel>Import progress</ProgressLabel><ProgressValue /></div><ProgressTrack><ProgressIndicator /></ProgressTrack></Progress>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { value: 65 } },
})

export const Preview = story.WithControl
