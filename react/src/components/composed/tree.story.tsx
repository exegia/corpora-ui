"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"

import { Tree } from "./tree"

function TreePreview(
  props: Pick<ComponentProps<typeof Tree>, "variant" | "collapsed" | "sound">
) {
  return (
    <Tree
      {...props}
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
  args: { initial: { variant: "navigation" } },
})

export const Preview = story.WithControl
