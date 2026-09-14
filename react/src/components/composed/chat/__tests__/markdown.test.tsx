import { describe, expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "jotai"

import { Markdown } from "../markdown"

const SRC = "# Title\n\nBody with `code`.\n\n- one\n- two"

describe("Markdown", () => {
  test("toggles between rendered preview and raw markup", async () => {
    const onCopy = mock(() => {})
    render(<Provider><Markdown source={SRC} onCopy={onCopy} /></Provider>)
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Title")
    expect(screen.getAllByRole("listitem").length).toBe(2)
    const user = userEvent.setup()
    await user.click(screen.getByRole("tab", { name: "Markup" }))
    await waitFor(() => {
      expect(screen.queryByRole("heading", { level: 1 })).toBeNull()
      expect(screen.getByText(/# Title/)).toBeDefined()
    })
    await user.click(screen.getByRole("button", { name: "Copy markdown" }))
    expect(onCopy).toHaveBeenCalledWith(SRC)
  })
})
