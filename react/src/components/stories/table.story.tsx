"use client"

import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/ui/table"

import { defineStory } from "@/registry/story"

function ComponentPreview({ variant }: { variant: "default" | "card" }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Table variant={variant}><TableCaption>Available export formats</TableCaption><TableHeader><TableRow><TableHead>Format</TableHead><TableHead>Use</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Plain text</TableCell><TableCell>Reading and quotation</TableCell></TableRow><TableRow><TableCell>JSON</TableCell><TableCell>Structured analysis</TableCell></TableRow></TableBody></Table>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { variant: "default" } },
})

export const Preview = story.WithControl
