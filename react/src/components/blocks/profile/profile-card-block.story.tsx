"use client"

import { defineStory } from "@/registry/story"

import { ProfileCardBlock } from "./profile-card-block"

export const story = defineStory({
  Component: ProfileCardBlock,
  args: {
    initial: {
      user: { name: "Jenny Hamilton", username: "@jennycodes" },
      defaultVariant: "expanded",
      sound: false,
    },
  },
})

export const Preview = story.WithControl
