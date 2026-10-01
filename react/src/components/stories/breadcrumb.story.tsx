"use client"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb"

import { MenuItem } from "@/components/ui/menu"
import { PopoverDescription, PopoverTitle } from "@/components/ui/popover"
import { useState } from "react"

import { defineStory } from "@/registry/story"

function ComponentPreview({ page }: { page: string }) {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { page: "Library" } },
})

export const Preview = story.WithControl

function OverlayPreview() {
  const [message, setMessage] = useState("")
  return (
    <div className="max-w-lg p-6 mx-auto w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem
            overlay={{
              type: "tooltip",
              label: "About Home",
              content: "Return to the documentation homepage.",
            }}
          >
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem
            overlay={{
              type: "menu",
              label: "Library actions",
              content: (
                <>
                  <MenuItem onClick={() => setMessage("Library bookmarked")}>
                    Bookmark library
                  </MenuItem>
                  <MenuItem onClick={() => setMessage("Library followed")}>
                    Follow updates
                  </MenuItem>
                </>
              ),
            }}
          >
            <BreadcrumbLink href="/atoms/breadcrumb">Library</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem
            overlay={{
              type: "popover",
              label: "About this page",
              content: (
                <>
                  <PopoverTitle>Breadcrumb</PopoverTitle>
                  <PopoverDescription>
                    Navigation that shows the current location.
                  </PopoverDescription>
                </>
              ),
            }}
          >
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <p role="status" className="mt-3 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  )
}

export const overlayStory = defineStory({
  Component: OverlayPreview,
  centered: false,
})
export const OverlayExample = overlayStory.WithControl
