"use client"

import { NumberField, NumberFieldGroup, NumberFieldDecrement, NumberFieldInput, NumberFieldIncrement } from "@/ui/number-field"

import { defineStory } from "@/registry/story"

function ComponentPreview({ disabled }: { disabled: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <NumberField defaultValue={3} min={1} max={20} disabled={disabled}><NumberFieldGroup><NumberFieldDecrement aria-label="Fewer results" /><NumberFieldInput aria-label="Result count" /><NumberFieldIncrement aria-label="More results" /></NumberFieldGroup></NumberField>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { disabled: false } },
})

export const Preview = story.WithControl
