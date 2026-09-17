"use client"

import type { ComponentProps } from "react"

import { defineStory } from "@/registry/story"

import { PasswordInput } from "./password-input"

type PreviewProps = Pick<
  ComponentProps<typeof PasswordInput>,
  | "visibilityToggle"
  | "showStrength"
  | "sound"
  | "placeholder"
  | "disabled"
  | "aria-label"
>

function PasswordInputPreview(props: PreviewProps) {
  return (
    <div className="p-6 flex justify-center">
      <PasswordInput {...props} className="max-w-sm w-full" />
    </div>
  )
}

export const story = defineStory({
  Component: PasswordInputPreview,
  args: {
    initial: {
      showStrength: true,
      visibilityToggle: true,
      sound: true,
      disabled: false,
      placeholder: "Enter a password",
      "aria-label": "Password",
    },
  },
})

export const Preview = story.WithControl
