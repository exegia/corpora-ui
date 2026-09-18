import { expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { defineStory } from "../story"
import type { GetProps } from "@fumadocs/story/vite/client"

function Sample({ size = "sm" }: { size?: "sm" | "lg" }) {
  return <div>Preview size: {size}</div>
}

test("forwards Vite-generated metadata through the shared story wrapper", () => {
  // The plugin injects this serialized empty object schema into its options.
  const options = {
    Component: Sample,
    centered: true,
    args: { initial: { size: "lg" as const } },
    _generated: {
      exportName: "story",
      controls:
        '[[2,[[1,2],[3,4]]],[0,"type"],[0,"object"],[0,"properties"],[1,[]]]',
    },
  }
  const story = defineStory(options)
  // The Vite plugin reads this exact type to generate the prop controls.
  const valid: GetProps<typeof story> = { size: "sm" }
  // @ts-expect-error Unknown sizes must not be erased by the wrapper's return type.
  const invalid: GetProps<typeof story> = { size: "not-a-size" }
  expect(valid.size).not.toBe(invalid.size)
  render(<story.WithControl />)
  expect(screen.getByText("Preview size: lg")).toBeDefined()
})
