import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ShellLayout } from "../shell-layout"
import { useShellPanels } from "../use-shell-panels"
import type { TPanelMap, UseShellPanelsOptions } from "../type"

const PANELS: TPanelMap = {
  left: {
    id: "nav",
    name: "Navigation",
    component: <div>Nav body</div>,
    open: true,
    side: "left",
  },
  right: {
    id: "inspector",
    name: "Inspector",
    component: <div>Inspector body</div>,
    open: false,
    side: "right",
  },
}

/** The desktop rail / drawer elements, queried by their landmark roles. */
function leftRail() {
  return screen.getByRole("navigation", { name: "Primary navigation" })
}

function rightDrawer(name = "Inspector") {
  return screen.getByRole("complementary", { name })
}

describe("ShellLayout", () => {
  test("renders panel content by side and children in the inset", () => {
    render(
      <ShellLayout panels={PANELS} variant="web">
        <div>Main content</div>
      </ShellLayout>
    )

    expect(leftRail().textContent).toContain("Nav body")
    expect(rightDrawer().textContent).toContain("Inspector body")
    expect(screen.getByRole("main").textContent).toContain("Main content")
  })

  test("names the right drawer after its panel", () => {
    render(<ShellLayout panels={PANELS} variant="web" />)

    expect(rightDrawer("Inspector")).toBeDefined()
  })

  test("the header triggers toggle their own side", async () => {
    const user = userEvent.setup()
    render(<ShellLayout panels={PANELS} variant="web" />)

    const leftTrigger = screen.getByRole("button", { name: "Toggle sidebar" })
    const rightTrigger = screen.getByRole("button", { name: "Toggle panel" })

    expect(leftRail().getAttribute("data-state")).toBe("expanded")
    expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")

    await user.click(leftTrigger)
    expect(leftRail().getAttribute("data-state")).toBe("collapsed")
    expect(leftTrigger.getAttribute("aria-expanded")).toBe("false")
    // The other side is untouched.
    expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")

    await user.click(rightTrigger)
    expect(rightDrawer().getAttribute("data-state")).toBe("expanded")
    expect(rightTrigger.getAttribute("aria-expanded")).toBe("true")
    expect(leftRail().getAttribute("data-state")).toBe("collapsed")
  })

  test("a panel's own open flag seeds its side's initial state", () => {
    render(
      <ShellLayout
        panels={{
          ...PANELS,
          right: { ...PANELS.right!, open: true },
        }}
        variant="web"
      />
    )

    expect(rightDrawer().getAttribute("data-state")).toBe("expanded")
  })

  test("an explicit defaultOpen record wins over the panel's flag", () => {
    render(
      <ShellLayout
        defaultOpen={{ left: false, right: false }}
        panels={{
          ...PANELS,
          right: { ...PANELS.right!, open: true },
        }}
        variant="web"
      />
    )

    expect(leftRail().getAttribute("data-state")).toBe("collapsed")
    expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")
  })

  test("⌘B toggles the left rail", async () => {
    const user = userEvent.setup()
    render(<ShellLayout panels={PANELS} variant="web" />)

    expect(leftRail().getAttribute("data-state")).toBe("expanded")

    await user.keyboard("{Meta>}b{/Meta}")
    expect(leftRail().getAttribute("data-state")).toBe("collapsed")

    await user.keyboard("{Meta>}b{/Meta}")
    expect(leftRail().getAttribute("data-state")).toBe("expanded")
  })
})

function HookedShell({
  onPanelChange,
}: {
  onPanelChange?: UseShellPanelsOptions["onPanelChange"]
}) {
  const panels = useShellPanels({ onPanelChange })

  return (
    <ShellLayout {...panels.providerProps} panels={PANELS} variant="web">
      <button onClick={() => panels.toggle("right")} type="button">
        External toggle
      </button>
    </ShellLayout>
  )
}

describe("useShellPanels", () => {
  test("reports every change as (open, side)", async () => {
    const user = userEvent.setup()
    const onPanelChange = mock(() => {})
    render(<HookedShell onPanelChange={onPanelChange} />)

    await user.click(screen.getByRole("button", { name: "Toggle panel" }))
    expect(onPanelChange).toHaveBeenLastCalledWith(true, "right")

    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))
    expect(onPanelChange).toHaveBeenLastCalledWith(false, "left")

    expect(onPanelChange).toHaveBeenCalledTimes(2)
  })

  test("controls the shell from outside it", async () => {
    const user = userEvent.setup()
    render(<HookedShell />)

    expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")

    await user.click(screen.getByRole("button", { name: "External toggle" }))
    expect(rightDrawer().getAttribute("data-state")).toBe("expanded")

    await user.click(screen.getByRole("button", { name: "External toggle" }))
    expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")
  })

  test("the shell's own triggers round-trip through the hook's state", async () => {
    const user = userEvent.setup()
    render(<HookedShell />)

    // Trigger click flows through providerProps into hook state and back —
    // the drawer only opens because the hook re-rendered the controlled
    // provider.
    await user.click(screen.getByRole("button", { name: "Toggle panel" }))
    expect(rightDrawer().getAttribute("data-state")).toBe("expanded")

    // The external toggle sees that state, so it closes rather than opens.
    await user.click(screen.getByRole("button", { name: "External toggle" }))
    expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")
  })
})
