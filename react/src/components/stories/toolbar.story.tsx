"use client"

import {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarLink,
} from "@/ui/toolbar"
import { Button } from "@/components/ui/button"
import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Toolbar aria-label="Document tools">
        <ToolbarGroup>
          <ToolbarButton
            render={<Button variant="ghost" />}
            disabled={disabled}
          >
            Copy
          </ToolbarButton>
          <ToolbarButton render={<Button variant="ghost" />}>
            Export
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarLink href="/atoms/button">Button guide</ToolbarLink>
      </Toolbar>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
