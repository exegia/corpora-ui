import { describe, expect, test } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"

import { Reference } from "../reference"

describe("Reference", () => {
  test("shows the passage on hover / focus only when given", async () => {
    render(
      <>
        <Reference preview="Sing, goddess, the wrath">Iliad 1.1</Reference>
        <Reference>Iliad 1.2</Reference>
      </>
    )
    expect(screen.queryByText("Sing, goddess, the wrath")).toBeNull()
    const chip = screen.getByText("Iliad 1.1").closest("[data-slot=reference-chip]")!
    await act(async () => {
      fireEvent.focus(chip)
      fireEvent.mouseEnter(chip)
      fireEvent.mouseMove(chip)
      await new Promise((r) => setTimeout(r, 400))
    })
    expect(await screen.findByText("Sing, goddess, the wrath")).toBeDefined()
    expect(document.querySelectorAll("[data-slot=reference-preview]").length).toBe(1)
  })
})
