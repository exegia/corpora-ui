import { defineStory } from "@/registry/story"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"

export const story = defineStory({
  Component: InputGroup,
  args: {
    fixed: {
      children: (
        <>
          <InputGroupAddon>Corpus</InputGroupAddon>
          <InputGroupInput aria-label="Search corpus" placeholder="Search…" />
        </>
      ),
    },
  },
})
