"use client"

import { Calendar } from "@/ui/calendar"
import { useState } from "react"
import { defineStory } from "@/registry/story"

function ComponentPreview({ showOutsideDays }: { showOutsideDays: boolean }) {
  const [date, setDate] = useState<Date | undefined>()
  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Calendar mode="single" selected={date} onSelect={setDate} showOutsideDays={showOutsideDays} />
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { showOutsideDays: true } },
})

export const Preview = story.WithControl
