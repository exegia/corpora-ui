"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { Verse } from "./verse"

export const story = defineStory({
  Component: Verse as FC<
    Pick<ComponentProps<typeof Verse>, "chapter" | "href" | "size" | "children">
  >,
  args: {
    initial: {
      chapter: "1:1",
      children: "In the beginning God created the heavens and the earth.",
    },
  },
})

export const Preview = story.WithControl
