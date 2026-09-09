import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"

import { SegmentedToggle } from "../segmented-toggle"

const OPTIONS = [{ value: "preview", label: "Preview" }, { value: "markup", label: "Markup" }] as const

describe("SegmentedToggle", () => {
  test("uncontrolled: click and arrow keys move the selection", () => {
    const onValueChange = mock(() => {})
    render(<SegmentedToggle label="View" options={OPTIONS} onValueChange={onValueChange} />)
    const [preview, markup] = screen.getAllByRole("radio")
    expect(preview.getAttribute("aria-checked")).toBe("true")
    fireEvent.click(markup)
    expect(markup.getAttribute("aria-checked")).toBe("true")
    expect(onValueChange).toHaveBeenLastCalledWith("markup")
    fireEvent.keyDown(markup, { key: "ArrowRight" })
    expect(preview.getAttribute("aria-checked")).toBe("true")
  })

  test("controlled: value wins over clicks", () => {
    render(<SegmentedToggle label="View" options={OPTIONS} value="markup" />)
    const [preview, markup] = screen.getAllByRole("radio")
    fireEvent.click(preview)
    expect(markup.getAttribute("aria-checked")).toBe("true")
  })
})
