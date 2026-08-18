import { describe, expect, mock, test } from "bun:test"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ShellLayout } from "../shell-layout"
import { useShellPanels } from "../use-shell-panels"
import { SHELL_WIDTHS } from "../utils"
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

/** The shell resolves its columns from CSS variables with hidden probe
 * elements. happy-dom has no layout engine, so every probe measures 0 and the
 * fit rule fails open — answer the probes with the real px behind each
 * variable so the rule works on the numbers it ships with:
 *
 *   rail 256 (56 folded) + body 360 + panel 320
 *
 * Only probes are intercepted; every other box keeps happy-dom's answer. */
function stubShellWidths() {
  const px = Object.fromEntries(
    Object.entries(SHELL_WIDTHS).map(([name, value]) => [
      name,
      Number.parseFloat(value),
    ])
  )
  const original = HTMLElement.prototype.getBoundingClientRect
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const isProbe =
      this.style.visibility === "hidden" && this.style.position === "absolute"
    if (!isProbe) return original.call(this)

    const variable = /var\((--[a-z-]+)\)/.exec(this.style.width)?.[1]
    return { width: (variable && px[variable]) || 0 } as DOMRect
  }
  return () => {
    HTMLElement.prototype.getBoundingClientRect = original
  }
}

interface HappyDOMWindow {
  happyDOM?: { setViewport: (viewport: { width: number }) => void }
}

/** Resize the viewport the way the shell hears it: happy-dom's own viewport
 * plus the `resize` event, inside `act` so the remeasure lands in this tick. */
function resizeViewport(width: number) {
  act(() => {
    ;(globalThis as HappyDOMWindow).happyDOM?.setViewport({ width })
    window.dispatchEvent(new Event("resize"))
  })
}

/** happy-dom's default, restored between viewport tests. */
const WIDE_VIEWPORT = 1024

/** Mount the shell at `width` px of viewport with real column widths in play.
 * The returned function puts both back — inside `act`, because happy-dom
 * fires `resize` on `setViewport` and the shell (still mounted until
 * cleanup) remeasures on it. */
function shellViewport(width: number) {
  const restoreWidths = stubShellWidths()
  ;(globalThis as HappyDOMWindow).happyDOM?.setViewport({ width })
  return () => {
    restoreWidths()
    act(() => {
      ;(globalThis as HappyDOMWindow).happyDOM?.setViewport({
        width: WIDE_VIEWPORT,
      })
    })
  }
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

  test("the shell owns the trigger icon, ignoring a panel's trigger node", async () => {
    const user = userEvent.setup()
    render(
      <ShellLayout
        panels={{
          ...PANELS,
          right: { ...PANELS.right!, trigger: <span>Custom trigger</span> },
        }}
        variant="web"
      />
    )

    const rightTrigger = screen.getByRole("button", { name: "Toggle panel" })
    expect(rightTrigger.textContent).not.toContain("Custom trigger")

    await user.click(rightTrigger)
    expect(rightDrawer().getAttribute("data-state")).toBe("expanded")
  })

  test("a side with no panel gets no header trigger", () => {
    render(<ShellLayout panels={{ left: PANELS.left! }} variant="web" />)

    expect(screen.getByRole("button", { name: "Toggle sidebar" })).toBeDefined()
    expect(screen.queryByRole("button", { name: "Toggle panel" })).toBeNull()
  })

  test("a panel's own defaultOpen flag seeds its side's initial state", () => {
    render(
      <ShellLayout
        panels={{
          ...PANELS,
          right: { ...PANELS.right!, defaultOpen: true },
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
          right: { ...PANELS.right!, defaultOpen: true },
        }}
        variant="web"
      />
    )

    expect(leftRail().getAttribute("data-state")).toBe("collapsed")
    expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")
  })

  test("keeps the right panel while every column fits", () => {
    // 256 + 360 + 320 = 936, inside happy-dom's 1024px viewport.
    const restore = shellViewport(WIDE_VIEWPORT)
    try {
      render(<ShellLayout panels={PANELS} variant="web" />)

      expect(rightDrawer()).toBeDefined()
      expect(screen.getByRole("button", { name: "Toggle panel" })).toBeDefined()
    } finally {
      restore()
    }
  })

  test("drops the right panel when the columns no longer fit", () => {
    // 936 needed, 800 available.
    const restore = shellViewport(800)
    try {
      render(<ShellLayout panels={PANELS} variant="web" />)

      expect(screen.queryByRole("complementary")).toBeNull()
      // Its trigger goes with it rather than driving nothing.
      expect(screen.queryByRole("button", { name: "Toggle panel" })).toBeNull()
      // The rail and the body are untouched — they are never the ones to go.
      expect(leftRail()).toBeDefined()
      expect(screen.getByRole("main")).toBeDefined()
    } finally {
      restore()
    }
  })

  test("folding the left rail hands its column to the right panel", async () => {
    const user = userEvent.setup()
    // Expanded: 256 + 360 + 320 = 936 > 800. Folded: 56 + 360 + 320 = 736.
    const restore = shellViewport(800)
    try {
      render(<ShellLayout panels={PANELS} variant="web" />)

      expect(leftRail().getAttribute("data-state")).toBe("expanded")
      expect(screen.queryByRole("complementary")).toBeNull()

      await user.click(screen.getByRole("button", { name: "Toggle sidebar" }))

      expect(leftRail().getAttribute("data-state")).toBe("collapsed")
      expect(rightDrawer()).toBeDefined()
      expect(screen.getByRole("button", { name: "Toggle panel" })).toBeDefined()
    } finally {
      restore()
    }
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
      {panels.isNarrow && <p>No room for the inspector</p>}
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

  test("mirrors the shell's too-narrow verdict back into the hook", () => {
    const restore = shellViewport(800)
    try {
      render(<HookedShell />)

      // The shell measures, the hook hears about it, and outside UI stands
      // down with the panel it would have driven.
      expect(screen.getByText("No room for the inspector")).toBeDefined()
      expect(screen.queryByRole("complementary")).toBeNull()
    } finally {
      restore()
    }
  })

  test("leaves the hook's verdict alone while the panel fits", () => {
    const restore = shellViewport(WIDE_VIEWPORT)
    try {
      render(<HookedShell />)

      expect(screen.queryByText("No room for the inspector")).toBeNull()
      expect(rightDrawer()).toBeDefined()
    } finally {
      restore()
    }
  })

  test("refuses to open the right panel while the shell is too narrow", async () => {
    const user = userEvent.setup()
    const onPanelChange = mock(() => {})
    const restore = shellViewport(800)
    try {
      render(<HookedShell onPanelChange={onPanelChange} />)

      await user.click(screen.getByRole("button", { name: "External toggle" }))

      // Nothing opened, and nothing was reported — the write never happened,
      // so widening the viewport later cannot surface a stale panel.
      expect(screen.queryByRole("complementary")).toBeNull()
      expect(onPanelChange).not.toHaveBeenCalled()
    } finally {
      restore()
    }
  })

  test("retires the right panel's state when the shell goes too narrow", async () => {
    const user = userEvent.setup()
    const onPanelChange = mock(() => {})
    const restore = shellViewport(WIDE_VIEWPORT)
    try {
      render(<HookedShell onPanelChange={onPanelChange} />)

      await user.click(screen.getByRole("button", { name: "External toggle" }))
      expect(rightDrawer().getAttribute("data-state")).toBe("expanded")

      resizeViewport(800)

      expect(screen.queryByRole("complementary")).toBeNull()
      expect(onPanelChange).toHaveBeenLastCalledWith(false, "right")

      // The state went with the panel: coming back does not spring it open.
      resizeViewport(WIDE_VIEWPORT)

      expect(rightDrawer().getAttribute("data-state")).toBe("collapsed")
    } finally {
      restore()
    }
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
