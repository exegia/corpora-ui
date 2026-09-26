"use client"

import { Autocomplete, AutocompleteInput, AutocompletePopup, AutocompleteList, AutocompleteItem, AutocompleteEmpty } from "@/ui/autocomplete"

import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Autocomplete items={["Manuscripts", "Translations", "Commentaries"]}>
      <AutocompleteInput aria-label="Collection" placeholder="Choose a collection" disabled={disabled} showClear />
      <AutocompletePopup><AutocompleteEmpty>No collections found.</AutocompleteEmpty><AutocompleteList>{(item: string) => <AutocompleteItem key={item} value={item}>{item}</AutocompleteItem>}</AutocompleteList></AutocompletePopup>
    </Autocomplete>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
