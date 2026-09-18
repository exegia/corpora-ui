"use client"

import { defineStory } from "@/registry/story"
import { FileBadgeTei } from "@/components/icons/file-badge-tei"


export const story = defineStory({
  Component: FileBadgeTei,
  args: { initial: { size: 64, title: "TEI file" } },
})

export const Preview = story.WithControl
