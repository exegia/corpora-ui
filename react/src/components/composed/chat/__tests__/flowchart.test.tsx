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
    expect(screen.getByText("Node 2")).toBeTruthy()
    const path = container.querySelector("path[data-edge]")!
    expect(path.getAttribute("d")).toMatch(/^M \d/)
    const canvas = container.querySelector('[data-slot="flowchart"]') as HTMLElement
    expect(parseFloat(canvas.style.minHeight)).toBeGreaterThan(0)
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

  it("offers add child, duplicate and delete from the context menu, confirming orphans", async () => {
    const onAdd = mock(() => {})
    const onRemove = mock(() => {})
    const onDuplicate = mock(() => {})
    render(<Flowchart.Root steps={STEPS} onAdd={onAdd} onRemove={onRemove} onDuplicate={onDuplicate} />)
    expect(screen.queryByRole("button", { name: /Add node/ })).toBeNull()
    fireEvent.contextMenu(screen.getByRole("button", { name: "A" }))
    fireEvent.click(await screen.findByRole("menuitem", { name: "Add child" }))
    expect(onAdd).toHaveBeenCalledWith("a", "bottom")
    fireEvent.contextMenu(screen.getByRole("button", { name: "B" }))
    fireEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }))
    expect(onDuplicate).toHaveBeenCalledWith("b")
    // leaf: removed outright
    fireEvent.contextMenu(screen.getByRole("button", { name: "B" }))
    fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }))
    expect(onRemove).toHaveBeenCalledWith("b")
    // parent: asks first
    fireEvent.contextMenu(screen.getByRole("button", { name: "A" }))
    fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog.textContent).toContain("orphaned")
    expect(onRemove).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Delete anyway" }))
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("a"))
  })

  it("hides the context menu when read-only", () => {
    render(<Flowchart.Root steps={STEPS} readOnly onAdd={() => {}} onRemove={() => {}} />)
    fireEvent.contextMenu(screen.getByRole("button", { name: "A" }))
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("renames a card from its pill and labels conditions Node n", async () => {
    const onRename = mock(() => {})
    render(
      <Flowchart.Root
        steps={[{ ...STEPS[0], kind: { label: "Trigger", hue: "#000" } }, { ...STEPS[1], condition: true }]}
        onRename={onRename}
      />
    )
    expect(screen.getByText("Trigger")).toBeTruthy()
    expect(screen.getByText("Node 2")).toBeTruthy()
    fireEvent.doubleClick(screen.getByText("Node 2"))
    const input = screen.getByRole("textbox", { name: "Node name" })
    fireEvent.change(input, { target: { value: "Cross references" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onRename).toHaveBeenCalledWith("b", "Cross references")
  })

  it("zooms with the buttons", () => {
    const { container } = render(<Flowchart.Root steps={STEPS} zoomable />)
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }))
    expect(screen.getByText("125%")).toBeTruthy()
    const canvas = container.querySelector('[data-slot="flowchart"]') as HTMLElement
    expect(canvas.style.backgroundSize).toContain("27.5px")
  })

  it("fills its parent and keeps a min-height floor when zooming out or removing a card", () => {
    const { container, rerender } = render(<Flowchart.Root steps={STEPS} zoomable height={300} />)
    const canvas = container.querySelector('[data-slot="flowchart"]') as HTMLElement
    expect(canvas.className).toContain("h-full")
    expect(canvas.style.minHeight).toBe("300px")
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }))
    expect(canvas.style.minHeight).toBe("300px")
    rerender(<Flowchart.Root steps={[STEPS[0]]} zoomable height={300} />)
    expect(canvas.style.minHeight).toBe("300px")
  })

  it("clears the selected card on a still click on empty canvas", () => {
    const { container } = render(<Flowchart.Root steps={STEPS} />)
    const step = screen.getByRole("button", { name: "A" })
    fireEvent.click(step)
    expect(step.getAttribute("aria-pressed")).toBe("true")
    const canvas = container.querySelector('[data-slot="flowchart"]') as HTMLElement
    fireEvent.pointerDown(canvas, { button: 0, clientX: 5, clientY: 5 })
    fireEvent.pointerUp(canvas)
    expect(step.getAttribute("aria-pressed")).toBe("false")
  })

  it("selects a connector and edits it from the toolbar", () => {
    const onEdgeRemove = mock(() => {})
    const onEdgeChange = mock(() => {})
    const { container } = render(<Flowchart.Root steps={STEPS} onEdgeRemove={onEdgeRemove} onEdgeChange={onEdgeChange} />)
    expect(screen.queryByRole("toolbar")).toBeNull()
    // the wide transparent twin is the click target
    fireEvent.click(container.querySelector('path[data-edge="a->b"]')!.nextElementSibling!)
    expect(screen.getByRole("toolbar", { name: "Connector" })).toBeTruthy()
    expect(container.querySelector('path[data-edge="a->b"]')!.getAttribute("stroke")).toContain("accent")
    fireEvent.click(screen.getByRole("button", { name: "Stroke 3" }))
    expect(onEdgeChange).toHaveBeenCalledWith("a->b", { strokeWidth: 3 })
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }))
    expect(onEdgeRemove).toHaveBeenCalledWith("a->b")
    expect(screen.queryByRole("toolbar")).toBeNull()
  })
})
