"use client"

import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/ui/command"

import { defineStory } from "@/registry/story"

function ComponentPreview({ placeholder }: { placeholder: string }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Command items={["Open library", "Browse references", "View projects"]}>
      <CommandInput aria-label="Find a command" placeholder={placeholder} />
      <CommandEmpty>No commands found.</CommandEmpty>
      <CommandList>{(item: string) => <CommandItem key={item} value={item}>{item}</CommandItem>}</CommandList>
    </Command>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { placeholder: "Find a command" } },
})

export const Preview = story.WithControl
