"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { StreamingText } from "./ai/streaming-text"

export const story = defineStory({
  Component: StreamingText as FC<
    Pick<
      ComponentProps<typeof StreamingText>,
      "paragraphs" | "streaming" | "wordMs"
    >
  >,
  args: {
    initial: {
      paragraphs: ["The Iliad opens with an invocation to the Muse."],
      streaming: true,
    },
  },
})

export const Preview = story.WithControl
