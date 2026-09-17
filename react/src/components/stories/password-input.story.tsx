"use client"

import { defineStory } from "@/registry/story"

import { PasswordInput } from "@/components/composed/password-input"

const story = defineStory({
  Component: PasswordInput,
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
