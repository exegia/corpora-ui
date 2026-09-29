import { describe, expect, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import { Text } from "@/components/atoms/text"
import { items } from "../constants"
import { TableOfContent } from "../toc"
import {
  hasSectionWithNestedNodes,
  isBibleOrQuranCollection,
} from "../utils"

describe("TableOfContent", () => {
  test("renders root sections with a render prop and exposes list/grid toggle for bible collections", () => {
    render(
      <TableOfContent
        items={items}
        renderSection={(item) => (
          <Text.Label>{`Section: ${String(item.label)}`}</Text.Label>
        )}
      />
    )

    expect(screen.getByText("Section: Old Testament")).toBeTruthy()
    expect(
      screen.queryByRole("button", { name: "Old Testament" })
    ).toBeNull()
    expect(screen.getByRole("button", { name: "List view" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Grid view" })).toBeTruthy()

    const gridToggle = screen.getByRole("button", { name: "Grid view" })
    fireEvent.click(gridToggle)

    expect(gridToggle.getAttribute("data-pressed")).toBe("")
  })
})

describe("navigation utils", () => {
  test("detects section-heavy bible-style collections", () => {
    expect(hasSectionWithNestedNodes(items)).toBe(true)
    expect(isBibleOrQuranCollection(items)).toBe(true)
  })
})
