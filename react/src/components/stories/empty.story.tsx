"use client"

import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/ui/empty"

import { defineStory } from "@/registry/story"

function ComponentPreview({ title }: { title: string }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Empty><EmptyHeader><EmptyTitle>{title}</EmptyTitle><EmptyDescription>Add a document to begin exploring your collection.</EmptyDescription></EmptyHeader><EmptyContent><a className="underline" href="/atoms/input">Read the input guide</a></EmptyContent></Empty>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { title: "No documents yet" } },
})

export const Preview = story.WithControl
