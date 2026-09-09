import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"

import { Attachment } from "../attachment"

describe("Attachment", () => {
  test("chip shows title + meta and fires onRemove", () => {
    const onRemove = mock(() => {})
    render(<Attachment kind="document" title="Q3.pdf" meta="PDF · 2.4 MB" onRemove={onRemove} />)
    expect(screen.getByText("Q3.pdf")).toBeDefined()
    expect(screen.getByText("PDF · 2.4 MB")).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  test("removable={false} hides the ✕", () => {
    render(<Attachment kind="image" title="a.jpg" onRemove={() => {}} removable={false} />)
    expect(screen.queryByRole("button", { name: "Remove" })).toBeNull()
  })

  test("preview renders per kind", () => {
    const { container } = render(
      <>
        <Attachment kind="media" variant="preview" title="clip" duration="0:42" />
        <Attachment kind="url-link" variant="preview" title="Exegia" domain="sketch.com" />
      </>
    )
    expect(screen.getByRole("button", { name: "Play" })).toBeDefined()
    expect(screen.getByText("0:42")).toBeDefined()
    expect(container.querySelectorAll('[data-variant="preview"]').length).toBe(2)
  })
})
