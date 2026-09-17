"use client"

import type { ComponentProps } from "react"
import { defineStory } from "@/registry/story"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type PreviewProps = Pick<ComponentProps<typeof Label>, "sound"> & {
  children: string
}

function LabelPreview({ children, ...props }: PreviewProps) {
  return (
    <div className="p-6">
      <div className="max-w-sm space-y-2">
        <>
          <Label {...props} htmlFor="story-manuscript">
            {children}
          </Label>
          <Input id="story-manuscript" placeholder="Enter a title" />
        </>
      </div>
    </div>
  )
}

const story = defineStory({
  Component: LabelPreview,
  args: { initial: { sound: false, children: "Manuscript title" } },
})

export const Preview = story.WithControl
