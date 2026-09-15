"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { Flowchart } from "./chat/flowchart"

export const story = defineStory({
  Component: Flowchart.Root as FC<
    Pick<
      ComponentProps<typeof Flowchart.Root>,
      "height" | "zoomable" | "readOnly"
    >
  >,
  args: {
    initial: {
      zoomable: true,
      height: 500,
    },
  },
})

export const Preview = story.WithControl
