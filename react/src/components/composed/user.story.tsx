"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { Info } from "./user/info"

export const story = defineStory({
  Component: Info as FC<
    Pick<
      ComponentProps<typeof Info>,
      "variant" | "user" | "description" | "size" | "direction" | "audio"
    >
  >,
  args: {
    initial: {
      variant: "info",
      user: {
        firstName: "Jenny",
        lastName: "Hamilton",
        role: "Editor",
      },
      description: "Corpus researcher",
      size: "default",
      direction: "sender",
      audio: "muted",
    },
  },
})

export const Preview = story.WithControl
