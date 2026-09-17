"use client"

import { defineStory } from "@/registry/story"

import { PasskeyManagerBlock } from "@/components/blocks/auth/passkey-manager-block"

export const story = defineStory({
  Component: PasskeyManagerBlock,
  args: {
    initial: {
      available: true,
      loading: false,
      passkeys: [{ id: "research-laptop", name: "Research laptop" }],
    },
  },
})

export const Preview = story.WithControl
