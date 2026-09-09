import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "jotai"

import { Markdown } from "../markdown"

const SRC = "# Title\n\nBody with `code`.\n\n- one\n- two"

describe("Markdown", () => {
  test("toggles between rendered preview and raw markup", () => {
    const onCopy = mock(() => {})
    render(<Provider><Markdown source={SRC} onCopy={onCopy} /></Provider>)
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Title")
    expect(screen.getAllByRole("listitem").length).toBe(2)
    fireEvent.click(screen.getByRole("tab", { name: "Markup" }))
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull()
    expect(screen.getByText(/# Title/)).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: "Copy markdown" }))
    expect(onCopy).toHaveBeenCalledWith(SRC)
  })
})
