"use client"

import { ContextMenu, ContextMenuTrigger, ContextMenuPopup, ContextMenuItem } from "@/ui/context-menu"

import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <ContextMenu><ContextMenuTrigger className="block rounded-lg border border-dashed p-8">Right-click this passage</ContextMenuTrigger>
      <ContextMenuPopup><ContextMenuItem disabled={disabled}>Copy reference</ContextMenuItem><ContextMenuItem>View source</ContextMenuItem></ContextMenuPopup>
    </ContextMenu>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
