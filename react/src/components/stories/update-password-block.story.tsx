"use client"

import { defineStory } from "@/registry/story"

import { UpdatePasswordBlock } from "@/components/blocks/auth/update-password-block"

export const story = defineStory({
  Component: UpdatePasswordBlock,
  args: {
    initial: { minStrength: 4 },
  },
})

export const Preview = story.WithControl
