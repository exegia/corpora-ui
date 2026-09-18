"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { Markdown } from "@/components/composed/chat/markdown"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof Markdown>,
    "source" | "view" | "defaultView" | "bare"
  >
>

function MarkdownPreview(props: TPreviewProps) {
  return <Markdown {...props} />
}

export const story = defineStory({
  Component: MarkdownPreview,
  args: {
    initial: {
      source:
        "# Corpus notes\n\nThe **Iliad** preserves several formulaic expressions.",
      view: "preview",
      bare: false,
    },
  },
})

export const Preview = story.WithControl
