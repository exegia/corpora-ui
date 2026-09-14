import { defineStory } from "@/registry/story"
import { Field, FieldLabel, FieldDescription } from "./field"
import { Input } from "./input"

export const story = defineStory({
  Component: Field,
  args: {
    initial: { disabled: false },
    fixed: {
      children: (
        <>
          <FieldLabel>Manuscript title</FieldLabel>
          <Input placeholder="Enter a title" />
          <FieldDescription>The title shown in your corpus.</FieldDescription>
        </>
      ),
    },
  },
})
