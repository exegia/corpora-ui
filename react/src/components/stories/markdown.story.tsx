"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { Markdown } from "@/components/composed/chat/markdown"

export const story = defineStory({
  Component: Markdown as FC<
    Pick<ComponentProps<typeof Markdown>, "source" | "view" | "bare">
  >,
  args: {
    initial: {
      source:
        "# Corpus notes\n\nThe **Iliad** preserves several formulaic expressions.",
      view: "preview",
      bare: false,
    },
  },
})

export const Preview = story.WithControl
