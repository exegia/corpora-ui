"use client"

import { defineStory } from "@/registry/story"

import { OnboardingBlock } from "./onboarding-block"

export const story = defineStory({
  Component: OnboardingBlock,
  args: {
    initial: { showCompleteScreen: true },
  },
})

export const Preview = story.WithControl
