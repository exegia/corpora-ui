"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { Attachment } from "@/components/composed/chat/attachment"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof Attachment>,
    "kind" | "variant" | "title" | "meta" | "removable"
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
    },
  },
})

export const Preview = story.WithControl
