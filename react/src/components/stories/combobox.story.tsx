"use client"

import { Combobox, ComboboxInput, ComboboxPopup, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/ui/combobox"

import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Combobox items={["Manuscripts", "Translations", "Commentaries"]}>
      <ComboboxInput aria-label="Collection" placeholder="Choose a collection" disabled={disabled} showClear />
      <ComboboxPopup><ComboboxEmpty>No collections found.</ComboboxEmpty><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxPopup>
    </Combobox>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
