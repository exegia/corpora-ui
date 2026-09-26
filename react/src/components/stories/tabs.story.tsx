"use client"

import { Tabs, TabsList, TabsTab, TabsPanel } from "@/ui/tabs"

import { defineStory } from "@/registry/story"

function ComponentPreview({ variant }: { variant: "default" | "underline" }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Tabs defaultValue="text"><TabsList variant={variant}><TabsTab value="text">Text</TabsTab><TabsTab value="notes">Notes</TabsTab></TabsList><TabsPanel value="text">Read the selected passage.</TabsPanel><TabsPanel value="notes">Review the editorial annotations.</TabsPanel></Tabs>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { variant: "default" } },
})

export const Preview = story.WithControl
