"use client"

import { defineStory } from "@/registry/story"

import { SignupBlock } from "@/components/blocks/auth/signup-block"

export const story = defineStory({
  Component: SignupBlock,
  args: {
    initial: {
      showNameField: true,
      showTerms: true,
      enforceStrongPassword: true,
    },
  },
})

export const Preview = story.WithControl
