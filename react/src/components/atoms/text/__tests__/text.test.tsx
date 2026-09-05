import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { Text } from "../index"

describe("Text", () => {
  test("maps variants to semantic elements", () => {
    render(
      <>
        <Text.Root>Default</Text.Root>
        <Text.Heading>Heading</Text.Heading>
        <Text.Paragraph>Paragraph</Text.Paragraph>
        <Text.Root href="#activity" type="link">
          Link
        </Text.Root>
        <Text.Root type="subscript">Note</Text.Root>
      </>
    )

    expect(screen.getByText("Default").tagName).toBe("SPAN")
    expect(screen.getByText("Heading").tagName).toBe("H2")
    expect(screen.getByText("Paragraph").tagName).toBe("P")
    expect(
      screen.getByRole("link", { name: "Link" }).getAttribute("href")
    ).toBe("#activity")
    expect(screen.getByText("Note").tagName).toBe("SUB")
  })

  test("supports named and numeric sizes", () => {
    render(
      <>
        <Text.Span size="small">Small</Text.Span>
        <Text.Root size={18}>Custom</Text.Root>
      </>
    )

    expect(screen.getByText("Small").className).toContain("text-sm")
    expect(screen.getByText("Custom").style.fontSize).toBe("18px")
  })

  test("marks selected text without relying on color alone", () => {
    render(<Text.Root selection="node-17">Selected corpus text</Text.Root>)

    const selected = screen.getByText("Selected corpus text")
    expect(selected.getAttribute("data-selection")).toBe("node-17")
    expect(selected.className).toContain("outline")
  })
})
