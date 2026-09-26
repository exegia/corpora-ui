"use client"

import { Kbd, KbdGroup } from "@/ui/kbd"

import { defineStory } from "@/registry/story"

function ComponentPreview({ shortcut }: { shortcut: string }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <KbdGroup><Kbd>⌘</Kbd><Kbd>{shortcut}</Kbd></KbdGroup>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { shortcut: "K" } },
})

export const Preview = story.WithControl
