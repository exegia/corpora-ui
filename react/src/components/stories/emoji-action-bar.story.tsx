"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { EmojiActionBar } from "@/components/composed/action-bar/emojis"

export const story = defineStory({
  Component: EmojiActionBar as FC<
    Pick<ComponentProps<typeof EmojiActionBar>, "hideMore">
  >,
  args: {
    initial: {
      hideMore: true,
    },
  },
})

export const Preview = story.WithControl
