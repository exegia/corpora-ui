"use client"

import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/ui/breadcrumb"

import { defineStory } from "@/registry/story"

function ComponentPreview({ page }: { page: string }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Breadcrumb><BreadcrumbList>
      <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator />
      <BreadcrumbItem><BreadcrumbPage>{page}</BreadcrumbPage></BreadcrumbItem>
    </BreadcrumbList></Breadcrumb>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { page: "Library" } },
})

export const Preview = story.WithControl
