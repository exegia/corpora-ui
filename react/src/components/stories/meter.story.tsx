"use client"

import { Meter, MeterLabel, MeterTrack, MeterIndicator, MeterValue } from "@/ui/meter"

import { defineStory } from "@/registry/story"

function ComponentPreview({ value }: { value: number }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Meter value={value}><div className="flex justify-between"><MeterLabel>Storage used</MeterLabel><MeterValue /></div><MeterTrack><MeterIndicator /></MeterTrack></Meter>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { value: 65 } },
})

export const Preview = story.WithControl
