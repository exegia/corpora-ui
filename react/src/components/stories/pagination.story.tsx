"use client"

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/ui/pagination"

import { defineStory } from "@/registry/story"

function ComponentPreview({ activePage }: { activePage: number }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Pagination><PaginationContent><PaginationItem><PaginationPrevious href="?page=1" /></PaginationItem>
      {[1, 2, 3].map((page) => <PaginationItem key={page}><PaginationLink href={`?page=${page}`} isActive={page === activePage}>{page}</PaginationLink></PaginationItem>)}
      <PaginationItem><PaginationNext href="?page=3" /></PaginationItem></PaginationContent></Pagination>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { activePage: 2 } },
})

export const Preview = story.WithControl
