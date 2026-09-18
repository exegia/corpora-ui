"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { FileBadgeTei } from "@/components/icons/file-badge-tei"

type TPreviewProps = Pick<ComponentProps<typeof FileBadgeTei>, "size" | "title">

function FileBadgeTeiPreview(props: TPreviewProps) {
  return (
    <div className="p-6">
      <div className="">
        <FileBadgeTei {...props} />
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: FileBadgeTeiPreview,
  args: { initial: { size: 64, title: "TEI file" } },
})

export const Preview = story.WithControl
