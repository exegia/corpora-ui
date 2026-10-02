"use client"

import { Group, GroupSeparator } from "@/ui/group"
import { Button } from "@/components/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({
  orientation,
}: {
  orientation: "horizontal" | "vertical"
}) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Group orientation={orientation} aria-label="Document actions">
        <Button variant="outline">Preview</Button>
        <GroupSeparator />
        <Button variant="outline">Download</Button>
      </Group>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { orientation: "horizontal" } },
})

export const Preview = story.WithControl
