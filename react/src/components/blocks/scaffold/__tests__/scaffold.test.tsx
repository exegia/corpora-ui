import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Scaffold, useScaffold } from "../index"

function Workspace({
  onClose,
  onSwap,
  onAdd,
  count,
  secondary = <span>Strip</span>,
}: {
  onClose?: () => void
  onSwap?: () => void
  onAdd?: () => void
  count?: number
  secondary?: React.ReactNode
}) {
  const scaffold = useScaffold()

  return (
    <Scaffold.Root {...scaffold.providerProps}>
      <Scaffold.Sidebar>
        <button onClick={scaffold.toggleInspector} type="button">
          Toggle inspector
        </button>
      </Scaffold.Sidebar>
      <Scaffold.Main>
        <Scaffold.Actions count={count} onAdd={onAdd} />
        <Scaffold.Canvas>
          <Scaffold.Panel
            key="alpha"
            name="Alpha"
            onClose={onClose}
            onSwap={onSwap}
            secondary={secondary}
          >
            <span>Primary body</span>
          </Scaffold.Panel>
        </Scaffold.Canvas>
        <Scaffold.Inspector>
          <span>Inspector body</span>
        </Scaffold.Inspector>
      </Scaffold.Main>
    </Scaffold.Root>
  )
}

describe("Scaffold", () => {
  test("renders rail, panel surfaces and secondary strip", () => {
    render(<Workspace />)

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeDefined()
    const panel = screen.getByRole("region", { name: "Alpha" })
    expect(panel.textContent).toContain("Primary body")
    expect(panel.textContent).toContain("Strip")
  })

  test("close and swap buttons render only with their callbacks and fire them", async () => {
    const user = userEvent.setup()
    const onClose = mock(() => {})
    const onSwap = mock(() => {})

    const { rerender } = render(<Workspace />)
    expect(screen.queryByRole("button", { name: "Close panel" })).toBeNull()
    expect(
      screen.queryByRole("button", { name: "Swap panel content" })
    ).toBeNull()

    rerender(<Workspace onClose={onClose} onSwap={onSwap} />)
    await user.click(screen.getByRole("button", { name: "Close panel" }))
    await user.click(screen.getByRole("button", { name: "Swap panel content" }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onSwap).toHaveBeenCalledTimes(1)
  })

  test("swap button needs a secondary strip", () => {
    render(<Workspace onSwap={() => {}} secondary={null} />)

    expect(
      screen.queryByRole("button", { name: "Swap panel content" })
    ).toBeNull()
  })

  test("actions cluster: Add fires, browse segment follows count", async () => {
    const user = userEvent.setup()
    const onAdd = mock(() => {})

    const { rerender } = render(<Workspace onAdd={onAdd} />)
    expect(screen.queryByRole("button", { name: "Browse panels" })).toBeNull()

    await user.click(screen.getByRole("button", { name: "Add" }))
    expect(onAdd).toHaveBeenCalledTimes(1)

    rerender(<Workspace count={2} onAdd={onAdd} />)
    const browse = screen.getByRole("button", { name: "Browse panels" })
    expect(browse.textContent).toContain("2")
  })

  test("inspector opens from outside state and hides again", async () => {
    const user = userEvent.setup()
    render(<Workspace />)

    const inspector = () =>
      screen.getByText("Inspector body").closest("aside") as HTMLElement
    expect(inspector().getAttribute("aria-hidden")).toBe("true")

    await user.click(screen.getByRole("button", { name: "Toggle inspector" }))
    expect(inspector().getAttribute("aria-hidden")).toBeNull()
    expect(
      screen.getByRole("complementary", { name: "Inspector" })
    ).toBeDefined()

    await user.click(screen.getByRole("button", { name: "Toggle inspector" }))
    expect(inspector().getAttribute("aria-hidden")).toBe("true")
  })

  test("root manages inspector state itself when uncontrolled", () => {
    render(
      <Scaffold.Root defaultInspectorOpen>
        <Scaffold.Main>
          <Scaffold.Inspector>
            <span>Drawer</span>
          </Scaffold.Inspector>
        </Scaffold.Main>
      </Scaffold.Root>
    )

    expect(
      screen.getByRole("complementary", { name: "Inspector" })
    ).toBeDefined()
  })
})
