"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { FileBadgeTei } from "@/components/icons/file-badge-tei"

type PreviewProps = Pick<ComponentProps<typeof FileBadgeTei>, "size" | "title">

function FileBadgeTeiPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="">
        <FileBadgeTei {...props} />
      </div>
    </div>
  )
}

const story = defineStory({
  Component: FileBadgeTeiPreview,
  args: { initial: { size: 64, title: "TEI file" } },
})

export const Preview = story.WithControl
