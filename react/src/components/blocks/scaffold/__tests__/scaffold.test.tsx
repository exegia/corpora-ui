import { describe, expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"

import { Scaffold, useScaffold } from "../index"
import type { TScaffoldPanelChild } from "../type"

function Strip() {
  return <span>Strip</span>
}

function Workspace({
  onClose,
  onSwap,
  onAdd,
  tabs,
  SecondaryPanel = <Strip />,
}: {
  onClose?: () => void
  onSwap?: () => void
  onAdd?: () => void
  /** Rendered as Actions children — the panel tabs. */
  tabs?: ReactNode
  /** Pass null to render the panel without a secondary strip. */
  SecondaryPanel?: TScaffoldPanelChild | null
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
        <Scaffold.Actions onAdd={onAdd}>{tabs}</Scaffold.Actions>
        <Scaffold.Canvas>
          <Scaffold.Panel
            key="alpha"
            name="Alpha"
            onClose={onClose}
            onSwap={onSwap}
            SecondaryPanel={SecondaryPanel ?? undefined}
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

/** The seam menu's compact toggle (icon-only, named by `swapLabel`). */
const menuToggle = () =>
  screen.queryByRole("button", { name: "Swap panel content" })

/** Under the id'd `#scaffold-actions` ancestor, happy-dom serves stale
 * selector-cache results to `waitFor` queries that start while an
 * AnimatePresence exit is still running — let the exit settle on real
 * timers, then query once. */
const settleExit = () => new Promise((resolve) => setTimeout(resolve, 400))

describe("Scaffold", () => {
  test("renders rail, panel surfaces and secondary strip", () => {
    render(<Workspace />)

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeDefined()
    const panel = screen.getByRole("region", { name: "Alpha" })
    expect(panel.textContent).toContain("Primary body")
    expect(panel.textContent).toContain("Strip")
  })

  test("close and menu buttons render only with their callbacks", async () => {
    const user = userEvent.setup()
    const onClose = mock(() => {})

    const { rerender } = render(<Workspace />)
    expect(screen.queryByRole("button", { name: "Close panel" })).toBeNull()
    expect(menuToggle()).toBeNull()

    rerender(<Workspace onClose={onClose} onSwap={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Close panel" }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(menuToggle()).toBeDefined()
  })

  test("seam menu opens; Swap fires onSwap, flips the panel and collapses the menu", async () => {
    const user = userEvent.setup()
    const onSwap = mock(() => {})
    render(<Workspace onSwap={onSwap} />)

    const panel = screen.getByRole("region", { name: "Alpha" })
    expect(panel.getAttribute("data-swapped")).toBeNull()

    // The compact toggle trades places with the Expand | Swap actions.
    await user.click(menuToggle() as HTMLElement)
    await user.click(await screen.findByRole("button", { name: "Swap" }))

    expect(onSwap).toHaveBeenCalledTimes(1)
    expect(panel.getAttribute("data-swapped")).toBe("")

    // Acting collapses the menu back to the compact toggle; the actions
    // leave with their exit animation.
    expect(
      await screen.findByRole("button", { name: "Swap panel content" })
    ).toBeDefined()
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Swap" })).toBeNull()
    )
  })

  test("expand trades the flexible slot and flips the chevron", async () => {
    const user = userEvent.setup()
    render(<Workspace onSwap={() => {}} />)

    const panel = screen.getByRole("region", { name: "Alpha" })
    const [top, bottom] = Array.from(
      panel.querySelectorAll('[data-slot^="scaffold-sub-panel"]')
    )
    expect(top.getAttribute("data-expanded")).toBe("")
    expect(bottom.getAttribute("data-expanded")).toBeNull()

    await user.click(menuToggle() as HTMLElement)
    await user.click(await screen.findByRole("button", { name: "Expand" }))

    expect(top.getAttribute("data-expanded")).toBeNull()
    expect(bottom.getAttribute("data-expanded")).toBe("")

    // Reopen: the chevron reflects the flipped state.
    await user.click(
      await screen.findByRole("button", { name: "Swap panel content" })
    )
    const expandButton = await screen.findByRole("button", { name: "Expand" })
    expect(
      expandButton
        .querySelector("svg.lucide-chevron-down")
        ?.classList.contains("rotate-180")
    ).toBe(true)

    // Expanding again restores the primary slot.
    await user.click(expandButton)
    expect(top.getAttribute("data-expanded")).toBe("")
    expect(bottom.getAttribute("data-expanded")).toBeNull()
  })

  test("seam menu needs a secondary strip", () => {
    render(<Workspace onSwap={() => {}} SecondaryPanel={null} />)

    expect(menuToggle()).toBeNull()
  })

  test("actions cluster: Add renders only with onAdd and fires", async () => {
    const user = userEvent.setup()
    const onAdd = mock(() => {})

    // Consumers omit onAdd at SCAFFOLD_PANEL_CAPACITY — the segment hides.
    const { rerender } = render(<Workspace />)
    expect(screen.queryByRole("button", { name: "Panel" })).toBeNull()

    rerender(<Workspace onAdd={onAdd} />)
    await user.click(screen.getByRole("button", { name: "Panel" }))
    expect(onAdd).toHaveBeenCalledTimes(1)

    rerender(<Workspace />)
    await settleExit()
    expect(screen.queryByRole("button", { name: "Panel" })).toBeNull()
  })

  test("panel tabs show their label; close renders only with onClose and fires", async () => {
    const user = userEvent.setup()
    const onCloseTab = mock(() => {})

    // Consumers omit onClose on the last remaining panel's tab.
    const { rerender } = render(
      <Workspace tabs={<Scaffold.Tab key="alpha">Alpha</Scaffold.Tab>} />
    )
    expect(screen.getByText("Alpha")).toBeDefined()
    expect(screen.queryByRole("button", { name: "Close Alpha" })).toBeNull()

    rerender(
      <Workspace
        tabs={
          <Scaffold.Tab
            key="alpha"
            closeLabel="Close Alpha"
            onClose={onCloseTab}
          >
            Alpha
          </Scaffold.Tab>
        }
      />
    )
    await user.click(screen.getByRole("button", { name: "Close Alpha" }))
    expect(onCloseTab).toHaveBeenCalledTimes(1)

    // Closing removes the tab — it animates out of the pill.
    rerender(<Workspace tabs={null} />)
    await settleExit()
    expect(screen.queryByText("Alpha")).toBeNull()
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
