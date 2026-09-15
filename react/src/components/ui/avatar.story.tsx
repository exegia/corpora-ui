"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Avatar } from "@/components/atoms/avatar"

type PreviewProps = Pick<
  ComponentProps<typeof Avatar>,
  "user" | "size" | "audio" | "loading"
>

function AvatarPreview(props: PreviewProps) {
  return (
    <div className="p-6">
      <div className="">
        <Avatar {...props} />
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: AvatarPreview,
  args: {
    initial: {
      size: "lg",
      loading: false,
      user: { firstName: "John", lastName: "Doe", status: "online" },
    },
  },
})

export const Preview = story.WithControl
