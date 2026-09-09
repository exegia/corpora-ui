import { afterEach, describe, expect, it, mock } from "bun:test"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

import { Flowchart, type StepNode } from "../flowchart"

const STEPS: StepNode[] = [
  { id: "a", row: 0, x: 0.5, w: 200, title: "A" },
  { id: "b", row: 1, x: 0.5, w: 200, title: "B" },
]

afterEach(cleanup)

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

  it("renders custom children and chains edges by default", () => {
    const { container } = render(<Flowchart.Root steps={[{ ...STEPS[0], children: <em>custom</em> }, STEPS[1]]} />)
    expect(screen.getByText("custom").tagName).toBe("EM")
    expect(container.querySelector('path[data-edge="a->b"]')).toBeTruthy()
  })

  it("fires onAdd with the side and onRemove, confirming orphans in an AlertDialog", async () => {
    const onAdd = mock(() => {})
    const onRemove = mock(() => {})
    render(<Flowchart.Root steps={STEPS} onAdd={onAdd} onRemove={onRemove} />)
    fireEvent.click(screen.getAllByRole("button", { name: "Add node right" })[0])
    expect(onAdd).toHaveBeenCalledWith("a", "right")
    // leaf: removed outright
    fireEvent.click(screen.getAllByRole("button", { name: "Remove node" })[1])
    expect(onRemove).toHaveBeenCalledWith("b")
    // parent: asks first
    fireEvent.click(screen.getAllByRole("button", { name: "Remove node" })[0])
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog.textContent).toContain("orphaned")
    expect(onRemove).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Delete anyway" }))
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("a"))
  })

  it("hides add / remove controls when read-only", () => {
    render(<Flowchart.Root steps={STEPS} readOnly onAdd={() => {}} onRemove={() => {}} />)
    expect(screen.queryByRole("button", { name: /Add node/ })).toBeNull()
    expect(screen.queryByRole("button", { name: "Remove node" })).toBeNull()
  })

  it("zooms with the buttons", () => {
    const { container } = render(<Flowchart.Root steps={STEPS} zoomable />)
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }))
    expect(screen.getByText("125%")).toBeTruthy()
    const canvas = container.querySelector('[data-slot="flowchart"]') as HTMLElement
    expect(canvas.style.backgroundSize).toContain("27.5px")
  })
})
