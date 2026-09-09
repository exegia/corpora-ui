import { describe, expect, it } from "bun:test"
import { render, screen, fireEvent } from "@testing-library/react"

import { Flowchart } from "../flowchart"

describe("Flowchart", () => {
  it("lays out the default steps and draws a connector", () => {
    const { container } = render(<Flowchart.Root />)
    expect(screen.getByText("New order created")).toBeTruthy()
    expect(screen.getByText("If / Else")).toBeTruthy()
    const path = container.querySelector("path[data-edge]")!
    expect(path.getAttribute("d")).toMatch(/^M \d/)
    const canvas = container.querySelector('[data-slot="flowchart"]') as HTMLElement
    expect(parseFloat(canvas.style.height)).toBeGreaterThan(0)
  })

  it("lights the connector when a step is selected", () => {
    const { container } = render(<Flowchart.Root />)
    const step = screen.getByRole("button", { name: /New order created/ })
    fireEvent.click(step)
    expect(step.getAttribute("aria-pressed")).toBe("true")
    expect(container.querySelector("path[data-edge]")!.getAttribute("stroke")).toContain("accent")
  })
})
