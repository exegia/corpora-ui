"use client"

import { defineStory } from "@/registry/story"

import { OnboardingBlock } from "@/components/blocks/auth/onboarding-block"

export const story = defineStory({
  Component: OnboardingBlock,
  args: {
    initial: { showCompleteScreen: true, autoFocus: false },
  },
})

export const Preview = story.WithControl
