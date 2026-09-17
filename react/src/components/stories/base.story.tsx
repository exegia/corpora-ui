"use client"

import type { ComponentProps } from "react"

import { defineStory } from "@/registry/story"

import { AiPanel } from "@/components/blocks/chat/base"

type PreviewProps = Pick<
  ComponentProps<typeof AiPanel>,
  "scope" | "headerTitle" | "className" | "thread" | "locked"
>

function BlockPreview(props: PreviewProps) {
  return <AiPanel {...props} />
}

export const story = defineStory({
  Component: BlockPreview,
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
