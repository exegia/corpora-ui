"use client"

import { defineStory } from "@/registry/story"
import { Button } from "@/components/ui/button"


export const story = defineStory({
  Component: Button,
  args: {
    initial: {
      children: "Consult manuscript",
      variant: "outline",
      size: "default",
      loading: false,
      disabled: false,
      sound: true,
    },
  },
})

export const Preview = story.WithControl
