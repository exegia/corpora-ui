"use client"

import { defineStory } from "@/registry/story"

import { AuthFlowBlock } from "@/components/blocks/auth/auth-flow-block"

export const story = defineStory({
  Component: AuthFlowBlock,
  args: {
    initial: {
      flowId: "docs-auth-flow-story",
      successTitle: "You’re signed in",
    },
  },
})

export const Preview = story.WithControl
