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
    <div className="flex justify-center p-6">
      <PasswordInput {...props} className="w-full max-w-sm" />
    </div>
  )
}

export const story = defineStory({
  Component: PasswordInputPreview,
  args: {
    initial: {
      showStrength: true,
      placeholder: "Enter a password",
      "aria-label": "Password",
    },
  },
})

export const Preview = story.WithControl
