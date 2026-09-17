"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { Logo } from "@/components/composed/logo"

export const story = defineStory({
  Component: Logo as FC<
    Pick<ComponentProps<typeof Logo>, "name" | "variant" | "href">
  >,
  args: {
    initial: {
      name: "Corpora",
      variant: "full",
    },
  },
})

export const Preview = story.WithControl
