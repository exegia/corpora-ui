"use client"

import { defineStory } from "@/registry/story"

import { Attachment } from "@/components/composed/chat/attachment"

export const story = defineStory({
  Component: Attachment,
  args: {
    initial: {
      kind: "document",
      variant: "default",
      title: "Iliad annotations.pdf",
      meta: "PDF · 2.4 MB"
    }
  }
})

export const Preview = story.WithControl
