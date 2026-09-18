"use client"

import { defineStory } from "@/registry/story"

import { PasskeySignInBlock } from "@/components/blocks/auth/passkey-sign-in-block"

export const story = defineStory({
  Component: PasskeySignInBlock,
  centered: true,
  args: {
    initial: { available: true, label: "Sign in with a passkey" },
  },
})

export const Preview = story.WithControl
