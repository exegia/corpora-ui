"use client"

import type { ComponentProps, FC } from "react"

import { defineStory } from "@/registry/story"

import { Verse } from "@/components/composed/verse"

type PreviewProps = Pick<
  ComponentProps<typeof Verse>,
  "chapter" | "href" | "size" | "children"
>

function VersePreview(props: PreviewProps) {
  return (
    <Verse
      {...props}
      chapterPopover={
        <div className="gap-1 grid">
          <span className="text-xs font-medium">Genesis {props.chapter}</span>
          <span className="text-sm text-muted-foreground">
            Opening reference in the creation account.
          </span>
        </div>
      }
    />
  )
}

export const story = defineStory({
  Component: VersePreview as FC<PreviewProps>,
  args: {
    initial: {
      chapter: "1:1",
      href: "#verse-preview",
      size: "medium",
      children: "In the beginning God created the heavens and the earth.",
    },
  },
})

export const Preview = story.WithControl
