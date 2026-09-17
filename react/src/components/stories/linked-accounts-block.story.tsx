"use client"

import { defineStory } from "@/registry/story"

import { LinkedAccountsBlock } from "@/components/blocks/auth/linked-accounts-block"

export const story = defineStory({
  Component: LinkedAccountsBlock,
  args: {
    initial: {
      loading: false,
      identities: [
        {
          id: "researcher",
          provider: "github",
          email: "researcher@example.com",
        },
      ],
    },
  },
})

export const Preview = story.WithControl
