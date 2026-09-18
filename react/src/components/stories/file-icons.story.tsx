"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"
import { FileBadgeTei } from "@/components/icons/file-badge-tei"

type TPreviewProps = TStoryData<
  Pick<ComponentProps<typeof FileBadgeTei>, "size" | "title">
>

function FileBadgeTeiPreview(props: TPreviewProps) {
  return <FileBadgeTei {...props} />
}

export const story = defineStory({
  Component: FileBadgeTeiPreview,
  args: { initial: { size: 64, title: "TEI file" } },
})

export const Preview = story.WithControl
