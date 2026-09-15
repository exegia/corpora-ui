"use client"

import { defineStory } from "@/registry/story"

import { AiPanel } from "./base"

export const story = defineStory({
  Component: AiPanel,
  args: {
    initial: {
      scope: { kind: "passage", label: "a.1", range: "¶1–¶2" },
      headerTitle: "Context Fabric",
      className: "h-[32rem] w-full",
      thread: "Validate this passage against the schema.",
    },
  },
})

export const Preview = story.WithControl
