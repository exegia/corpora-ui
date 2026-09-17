"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { SocialProviders } from "./social-providers"

export const story = defineStory({
  Component: SocialProviders as FC<
    Pick<
      ComponentProps<typeof SocialProviders>,
      "providers" | "action" | "layout" | "disabled"
    >
  >,
  args: {
    initial: {
      action: "continue",
      layout: "stack",
      providers: ["google", "apple", "github"],
      disabled: false,
    },
  },
})

export const Preview = story.WithControl
