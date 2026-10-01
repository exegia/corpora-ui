import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { Text } from "@/components/atoms/text"
import { items } from "../../constants"
import { Root } from "../default"
import { hasSectionWithNestedNodes, isBibleOrQuranCollection } from "../utils"

describe("TOC sections", () => {
  test("renders root sections using the render prop", () => {
    render(
      <Root
        items={items}
        renderSection={(item) => (
          <Text.Label>{`Section: ${String(item.label)}`}</Text.Label>
        )}
      />
    )
    expect(screen.getByText("Section: Old Testament")).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Old Testament" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Grid view" })).toBeNull()
  })
  test("detects section-heavy bible collections", () => {
    expect(hasSectionWithNestedNodes(items)).toBe(true)
    expect(isBibleOrQuranCollection(items)).toBe(true)
  })
})
