"use client"

import { defineStory } from "@/registry/story"

import { CodeAuthBlock } from "@/components/blocks/auth/code-auth-block"

export const story = defineStory({
  Component: CodeAuthBlock,
  args: {
    initial: {
      channel: "email",
      destination: "r•••@example.com",
      length: 6,
      autoSubmit: true,
      resendSeconds: 30,
    },
  },
})

export const Preview = story.WithControl
