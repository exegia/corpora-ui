import { describe, expect, mock, test } from "bun:test"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"

import { Scaffold, useScaffold } from "../index"
import type { TScaffoldPanelChild } from "../type"
import { getPanelCapacity } from "../utils"

// The canvas measures itself through ResizeObserver; this stub hands the
// callback to the test so it can drive the width deterministically.
let observeCanvas: ResizeObserverCallback | undefined
globalThis.ResizeObserver = class {
  constructor(callback: ResizeObserverCallback) {
    observeCanvas = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const resizeCanvas = (width: number) =>
  act(() => {
    observeCanvas?.(
      [{ contentRect: { width } }] as unknown as ResizeObserverEntry[],
      undefined as unknown as ResizeObserver
    )
  })

function Strip() {
  return <span>Strip</span>
}

function Workspace({
  onSwap,
  onCloseSecondary,
  onAdd,
  tabs,
  SecondaryPanel = <Strip />,
}: {
  onSwap?: () => void
  onCloseSecondary?: () => void
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
            onCloseSecondary={onCloseSecondary}
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

  test("seam menu renders only with a callback; actions stay hidden until opened", () => {
    const { rerender } = render(<Workspace />)
    expect(menuToggle()).toBeNull()

    rerender(<Workspace onSwap={() => {}} />)
    expect(menuToggle()).toBeDefined()
    // Collapsed: the action segment is aria-hidden and inert.
    expect(screen.queryByRole("button", { name: "Swap" })).toBeNull()

    // The Close action alone also earns the menu.
    rerender(<Workspace onCloseSecondary={() => {}} />)
    expect(menuToggle()).toBeDefined()
  })

  test("seam menu Close renders only with onCloseSecondary, fires and collapses", async () => {
    const user = userEvent.setup()
    const onCloseSecondary = mock(() => {})

    const { rerender } = render(<Workspace onSwap={() => {}} />)
    await user.click(menuToggle() as HTMLElement)
    expect(await screen.findByRole("button", { name: "Swap" })).toBeDefined()
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()

    rerender(
      <Workspace onCloseSecondary={onCloseSecondary} onSwap={() => {}} />
    )
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(onCloseSecondary).toHaveBeenCalledTimes(1)

    // Acting collapses the menu back to the compact toggle.
    expect(menuToggle()).toBeDefined()
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
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

  test("expand chevron mirrors when the panel is swapped", async () => {
    const user = userEvent.setup()
    render(<Workspace onSwap={() => {}} />)

    // Swap first — column-reverse puts the strip visually on top.
    await user.click(menuToggle() as HTMLElement)
    await user.click(await screen.findByRole("button", { name: "Swap" }))

    // Primary still holds the flexible slot, but the strip that grows
    // next now sits on top — the chevron points up.
    await user.click(
      await screen.findByRole("button", { name: "Swap panel content" })
    )
    const expandButton = await screen.findByRole("button", { name: "Expand" })
    const chevron = () => expandButton.querySelector("svg.lucide-chevron-down")
    expect(chevron()?.classList.contains("rotate-180")).toBe(true)

    // After expanding, the primary — now visually at the bottom — grows
    // next: the chevron points down again.
    await user.click(expandButton)
    await user.click(
      await screen.findByRole("button", { name: "Swap panel content" })
    )
    expect(chevron()?.classList.contains("rotate-180")).toBe(false)
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

  test("capacity grants each panel 320px plus the gaps between them", () => {
    expect(getPanelCapacity(null)).toBe(3)
    expect(getPanelCapacity(976)).toBe(3) // 3×320 + 2×8
    expect(getPanelCapacity(975)).toBe(2)
    expect(getPanelCapacity(648)).toBe(2) // 2×320 + 8
    expect(getPanelCapacity(647)).toBe(1)
    expect(getPanelCapacity(100)).toBe(1) // never below one panel
    expect(getPanelCapacity(5000)).toBe(3) // never above the cap
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

const PANEL_IDS = ["one", "two", "three"] as const

function ResponsiveWorkspace() {
  return (
    <Scaffold.Root>
      <Scaffold.Main>
        <Scaffold.Actions>
          {PANEL_IDS.map((id) => (
            <Scaffold.Tab key={id} panelId={id}>
              {`Tab ${id}`}
            </Scaffold.Tab>
          ))}
        </Scaffold.Actions>
        <Scaffold.Canvas>
          {PANEL_IDS.map((id) => (
            <Scaffold.Panel key={id} id={id} name={`Panel ${id}`}>
              <span>{`Body ${id}`}</span>
            </Scaffold.Panel>
          ))}
        </Scaffold.Canvas>
      </Scaffold.Main>
    </Scaffold.Root>
  )
}

const panel = (id: string) =>
  screen.queryByRole("region", { name: `Panel ${id}` })

const tab = (id: string) => screen.getByRole("button", { name: `Tab ${id}` })

describe("Scaffold responsive panels", () => {
  test("narrowing hides the oldest panel; widening restores it", async () => {
    render(<ResponsiveWorkspace />)

    resizeCanvas(976)
    for (const id of PANEL_IDS) expect(panel(id)).not.toBeNull()

    // Two panels' worth of room — the least-recently-activated hides.
    resizeCanvas(700)
    await settleExit()
    expect(panel("one")).toBeNull()
    expect(panel("two")).not.toBeNull()
    expect(panel("three")).not.toBeNull()
    expect(
      tab("one")
        .closest('[data-slot="scaffold-tab"]')
        ?.getAttribute("data-panel-hidden")
    ).toBe("")
    expect(tab("one").getAttribute("aria-pressed")).toBe("false")

    // Room returns — the auto-hidden panel comes back by itself.
    resizeCanvas(1200)
    expect(await screen.findByRole("region", { name: "Panel one" })).toBeDefined()
    expect(tab("one").getAttribute("aria-pressed")).toBe("true")
  })

  test("pressing a hidden tab shows its panel, hiding the oldest visible one", async () => {
    const user = userEvent.setup()
    render(<ResponsiveWorkspace />)

    resizeCanvas(700)
    await settleExit()
    expect(panel("one")).toBeNull()

    await user.click(tab("one"))
    await settleExit()
    expect(panel("one")).not.toBeNull()
    expect(panel("two")).toBeNull()
    expect(panel("three")).not.toBeNull()
  })

  test("pressing a visible tab hides its panel; the last one never hides", async () => {
    const user = userEvent.setup()
    render(<ResponsiveWorkspace />)

    resizeCanvas(400)
    await settleExit()
    // One panel's worth of room — only the newest activation stays.
    expect(panel("one")).toBeNull()
    expect(panel("two")).toBeNull()
    expect(panel("three")).not.toBeNull()

    // The sole visible panel refuses to hide.
    await user.click(tab("three"))
    await settleExit()
    expect(panel("three")).not.toBeNull()

    // Activating another trades places with it.
    await user.click(tab("one"))
    await settleExit()
    expect(panel("one")).not.toBeNull()
    expect(panel("three")).toBeNull()
  })

  test("user-hidden panels stay hidden when the canvas widens", async () => {
    const user = userEvent.setup()
    render(<ResponsiveWorkspace />)

    resizeCanvas(1200)
    await user.click(tab("two"))
    await settleExit()
    expect(panel("two")).toBeNull()

    resizeCanvas(1400)
    await settleExit()
    expect(panel("two")).toBeNull()

    // Its tab presses back to visible.
    await user.click(tab("two"))
    expect(await screen.findByRole("region", { name: "Panel two" })).toBeDefined()
  })
})
