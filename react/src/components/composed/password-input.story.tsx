"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { PasswordInput } from "./password-input"

export const story = defineStory({
  Component: PasswordInput as FC<
    Pick<
      ComponentProps<typeof PasswordInput>,
      | "visibilityToggle"
      | "showStrength"
      | "sound"
      | "placeholder"
      | "disabled"
      | "aria-label"
    >
  >,
  args: {
    initial: {
      showStrength: true,
      placeholder: "Enter a password",
      "aria-label": "Password",
    },
  },
})

export const Preview = story.WithControl
