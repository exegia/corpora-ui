"use client"

import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"

import { defineStory } from "@/registry/story"

function ComponentPreview({ variant }: { variant: "default" | "underline" }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Tabs defaultValue="text">
        <TabsList variant={variant}>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="text">Read the selected passage.</TabsContent>
        <TabsContent value="notes">
          Review the editorial annotations.
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { variant: "default" } },
})

export const Preview = story.WithControl
