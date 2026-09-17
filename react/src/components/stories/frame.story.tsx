"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Frame, FrameFooter } from "@/components/ui/frame"
import { Card, CardPanel } from "@/components/ui/card"

type PreviewProps = Pick<ComponentProps<typeof Frame>, "className"> & {
  children: string
}

function FramePreview({ children, ...props }: PreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-sm">
        <Frame {...props}>
          <Card>
            <CardPanel>{children}</CardPanel>
          </Card>
          <FrameFooter>Updated today</FrameFooter>
        </Frame>
      </div>
    </div>
  )
}

const story = defineStory({
  Component: FramePreview,
  args: { initial: { className: "", children: "Manuscript notes" } },
})

export const Preview = story.WithControl
