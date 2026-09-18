"use client"

import type { ComponentProps } from "react"
import { defineStory, type TStoryData } from "@/registry/story"

import { PasswordInput } from "@/components/composed/password-input"

type TPreviewProps = TStoryData<
  Pick<
    ComponentProps<typeof PasswordInput>,
    | "visibilityToggle"
    | "showStrength"
    | "placeholder"
    | "disabled"
    | "sound"
  >
> & { autoComplete?: "new-password" | "current-password" | "off" | "on" }

function PasswordInputPreview(props: TPreviewProps) {
  return <PasswordInput {...props} />
}

export const story = defineStory({
  Component: PasswordInputPreview,
  args: {
    initial: {
      visibilityToggle: true,
      showStrength: false,
      autoComplete: "new-password",
      placeholder: "Enter password",
    },
  },
})

export const Preview = story.WithControl
