"use client"

import type { ComponentProps } from "react"

import { defineStory } from "@/registry/story"

import { ProfileCardBlock } from "@/components/blocks/profile/profile-card-block"

type TPreviewProps = Pick<
  ComponentProps<typeof ProfileCardBlock>,
  "user" | "variant" | "sound" | "presence" | "menuWidth" | "align" | "side"
>

function BlockPreview(props: TPreviewProps) {
  return <ProfileCardBlock {...props} />
}

export const story = defineStory({
  Component: BlockPreview,
  args: {
    initial: {
      user: { name: "Jenny Hamilton", username: "@jennycodes" },
      variant: "expanded",
      sound: false,
    },
  },
})

export const Preview = story.WithControl
