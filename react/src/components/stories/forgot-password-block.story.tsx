"use client"

import { defineStory } from "@/registry/story"

import { ForgotPasswordBlock } from "@/components/blocks/auth/forgot-password-block"

export const story = defineStory({
  Component: ForgotPasswordBlock,
  args: {
    initial: {},
  },
})

export const Preview = story.WithControl
