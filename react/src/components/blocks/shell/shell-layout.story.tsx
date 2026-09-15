"use client"

import { defineStory } from "@/registry/story"

import { ShellLayout } from "./shell-layout"

export const story = defineStory({
  Component: ShellLayout,
  args: {
    initial: {
      variant: "web",
      className: "h-[28rem] w-full",
      children: "Corpus workspace",
      header: "Context Fabric",
    },
  },
})

export const Preview = story.WithControl
