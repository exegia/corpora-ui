"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { ContextCards } from "@/components/composed/chat/context-cards"

export const story = defineStory({
  Component: ContextCards as FC<
    Pick<ComponentProps<typeof ContextCards>, "cards" | "header" | "count">
  >,
  args: {
    initial: {
      cards: [
        {
          title: "Iliad 1.1",
          meta: "Opening invocation",
          snippet: "Sing, goddess, the anger of Achilles.",
          file: {
            name: "iliad.txt",
            type: "TXT",
          },
        },
      ],
    },
  },
})

export const Preview = story.WithControl
