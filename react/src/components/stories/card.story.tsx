"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card"

type PreviewProps = Pick<ComponentProps<typeof Card>, "className"> & {
  children: string
}

function CardPreview({ children, ...props }: PreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-sm">
        <Card {...props}>
          <CardHeader>
            <CardTitle>Manuscript</CardTitle>
          </CardHeader>
          <CardPanel>{children}</CardPanel>
        </Card>
      </div>
    </div>
  )
}

export const story = defineStory({
  Component: CardPreview,
  args: {
    initial: {
      className: "",
      children: "Explore this passage and its annotations.",
    },
  },
})

export const Preview = story.WithControl
