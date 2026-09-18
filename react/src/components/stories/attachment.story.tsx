"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { Attachment } from "@/components/composed/chat/attachment"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof Attachment>,
    | "kind"
    | "variant"
    | "title"
    | "meta"
    | "removable"
    | "src"
    | "thumbnail"
    | "previewText"
  >
>

function AttachmentPreview(props: TPreviewProps) {
  return <Attachment {...props} />
}

export const story = defineStory({
  Component: AttachmentPreview,
  args: {
    initial: {
      kind: "document",
      variant: "default",
      title: "Iliad annotations.pdf",
      meta: "PDF · 2.4 MB",
      previewText:
        "Iliad · Book 1\n\nAnnotation notes\n¶12 — Compare the paragraph boundary with the source edition.\n¶17 — Check the speaker attribution and lemma links.",
    },
  },
})

export const Preview = story.WithControl
