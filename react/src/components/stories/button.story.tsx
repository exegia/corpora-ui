"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"
import { Button } from "@/components/ui/button"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof Button>,
    "variant" | "size" | "loading" | "disabled" | "sound" | "children"
  >
>

function ButtonPreview(props: TPreviewProps) {
  return <Button {...props} />
}

export const story = defineStory({
  Component: ButtonPreview,
  args: {
    initial: {
      children: "Consult manuscript",
      variant: "outline",
      size: "default",
      loading: false,
      disabled: false,
      sound: true,
    },
  },
})

export const Preview = story.WithControl
