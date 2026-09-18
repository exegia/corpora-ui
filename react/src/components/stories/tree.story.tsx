"use client"

import { defineStory } from "@/registry/story"

import { Tree } from "@/components/composed/tree"

function TreePreview({ sound }: { sound: boolean }) {
  return (
    <Tree
      sound={sound}
      variant="navigation"
      items={[
        {
          id: "corpora",
          label: "Corpora",
          children: [
            { id: "iliad", label: "Iliad" },
            { id: "odyssey", label: "Odyssey" },
          ],
        },
      ]}
    />
  )
}

export const story = defineStory({
  Component: TreePreview,
  args: { initial: { sound: true } },
})

export const Preview = story.WithControl
