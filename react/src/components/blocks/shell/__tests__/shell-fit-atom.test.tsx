import { describe, expect, test } from "bun:test"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createStore, getDefaultStore } from "jotai"

import { ExegiaProvider } from "@/state"
import { ShellLayout } from "../shell-layout"
import {
  measureShellFitAtom,
  mountShellFitAtom,
  removeShellFitInstance,
  resetShellPanelWidthAtom,
  resizeShellPanelAtom,
  shellFitFitsAtom,
  shellFitMeasuredAtom,
  shellFitPanelBoundsAtom,
  shellFitPanelWidthAtom,
  shellFitRequestedWidthAtom,
  shellFitStateAtom,
} from "../shell-fit-atom"
import type { ShellMetrics } from "../shell-metrics"
import { useShellFitActions, useShellFitState } from "../use-shell-fit-state"
import { useShellPanels } from "../use-shell-panels"
import type { TPanelMap } from "../type"
import { SHELL_WIDTHS } from "../utils"

type Store = ReturnType<typeof createStore>

/** The shell's shipping numbers on a 1024px viewport: rail 256 + body 360 +
 * panel 320 = 936, with 32px of frame. */
const WIDE: ShellMetrics = {
  rail: 256,
  insetMin: 360,
  panelMin: 320,
  viewport: 1024,
  chrome: 32,
}

/** The same shell squeezed to 800px — 936 needed, no room. */
const NARROW: ShellMetrics = { ...WIDE, viewport: 800 }

function measure(store: Store, id: string, metrics: ShellMetrics) {
  store.set(measureShellFitAtom(id), metrics)
}

describe("shell-fit atoms · unmeasured", () => {
  test("fails open: fits, no width, no measurement", () => {
    const store = createStore()

    expect(store.get(shellFitFitsAtom("a"))).toBe(true)
    expect(store.get(shellFitMeasuredAtom("a"))).toBeNull()
    expect(store.get(shellFitPanelWidthAtom("a"))).toBeNull()
    expect(store.get(shellFitPanelBoundsAtom("a"))).toEqual({ min: 0, max: 0 })
  })

  test("a resize before any measurement is remembered unclamped", () => {
    const store = createStore()
    store.set(resizeShellPanelAtom("a"), 900)

    // Nothing to clamp against yet, so the ask is kept as-is …
    expect(store.get(shellFitRequestedWidthAtom("a"))).toBe(900)
    expect(store.get(shellFitPanelWidthAtom("a"))).toBeNull()

    // … and clamped on read the moment there is a room to clamp to.
    measure(store, "a", WIDE)
    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(1024 - 32 - 256 - 360)
  })
})

describe("shell-fit atoms · the rule", () => {
  test("fits while every column has its floor, not once they do not", () => {
    const store = createStore()

    measure(store, "a", WIDE)
    expect(store.get(shellFitFitsAtom("a"))).toBe(true)

    measure(store, "a", NARROW)
    expect(store.get(shellFitFitsAtom("a"))).toBe(false)
  })

  test("the panel opens at its floor and may grow into the body's slack", () => {
    const store = createStore()
    measure(store, "a", WIDE)

    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(320)
    expect(store.get(shellFitPanelBoundsAtom("a"))).toEqual({
      min: 320,
      max: 1024 - 32 - 256 - 360,
    })
  })

  test("a resize is clamped on the way in", () => {
    const store = createStore()
    measure(store, "a", WIDE)

    store.set(resizeShellPanelAtom("a"), 900)
    expect(store.get(shellFitRequestedWidthAtom("a"))).toBe(376)

    store.set(resizeShellPanelAtom("a"), 10)
    expect(store.get(shellFitRequestedWidthAtom("a"))).toBe(320)
  })

  test("a narrowing viewport pulls the panel down without forgetting the ask", () => {
    const store = createStore()
    measure(store, "a", WIDE)
    store.set(resizeShellPanelAtom("a"), 360)
    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(360)

    // Less slack: 1000 - 32 - 256 - 360 = 352.
    measure(store, "a", { ...WIDE, viewport: 1000 })
    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(352)
    expect(store.get(shellFitRequestedWidthAtom("a"))).toBe(360)

    // Room comes back, and so does the width they chose.
    measure(store, "a", WIDE)
    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(360)
  })

  test("folding the rail hands its column to the panel's ceiling", () => {
    const store = createStore()
    measure(store, "a", WIDE)
    expect(store.get(shellFitPanelBoundsAtom("a")).max).toBe(376)

    measure(store, "a", { ...WIDE, rail: 56 })
    expect(store.get(shellFitPanelBoundsAtom("a")).max).toBe(576)
  })

  test("a measurement that changes nothing is not a change", () => {
    const store = createStore()
    measure(store, "a", WIDE)
    const before = store.get(shellFitStateAtom("a"))

    measure(store, "a", { ...WIDE })
    expect(store.get(shellFitStateAtom("a"))).toBe(before)
  })
})

describe("shell-fit atoms · seed and reset", () => {
  test("mount seeds the requested width once", () => {
    const store = createStore()
    store.set(mountShellFitAtom("a"), { panelWidth: 400 })
    measure(store, "a", { ...WIDE, viewport: 1400 })
    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(400)

    // A later mount (StrictMode, a re-render with a new default) never
    // overwrites a width the user dragged to.
    store.set(resizeShellPanelAtom("a"), 500)
    store.set(mountShellFitAtom("a"), { panelWidth: 340 })
    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(500)
  })

  test("reset goes back to the seed, or the floor without one", () => {
    const store = createStore()
    store.set(mountShellFitAtom("a"), { panelWidth: 400 })
    measure(store, "a", { ...WIDE, viewport: 1400 })
    store.set(resizeShellPanelAtom("a"), 500)

    store.set(resetShellPanelWidthAtom("a"))
    expect(store.get(shellFitPanelWidthAtom("a"))).toBe(400)

    measure(store, "b", WIDE)
    store.set(resizeShellPanelAtom("b"), 360)
    store.set(resetShellPanelWidthAtom("b"))
    expect(store.get(shellFitPanelWidthAtom("b"))).toBe(320)
  })
})

describe("shell-fit atoms · instances", () => {
  test("two ids never share state", () => {
    const store = createStore()
    measure(store, "a", WIDE)
    measure(store, "b", NARROW)

    expect(store.get(shellFitFitsAtom("a"))).toBe(true)
    expect(store.get(shellFitFitsAtom("b"))).toBe(false)
  })

  test("removing an instance drops its state", () => {
    const store = createStore()
    measure(store, "a", WIDE)
    store.set(resizeShellPanelAtom("a"), 360)

    removeShellFitInstance("a")

    expect(store.get(shellFitMeasuredAtom("a"))).toBeNull()
    expect(store.get(shellFitRequestedWidthAtom("a"))).toBeNull()
  })

  test("two stores never share state", () => {
    const one = createStore()
    const two = createStore()
    measure(one, "a", NARROW)

    expect(one.get(shellFitFitsAtom("a"))).toBe(false)
    expect(two.get(shellFitFitsAtom("a"))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// By id, through React
// ---------------------------------------------------------------------------

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
    open: true,
    side: "right",
  },
}

/** Answer the shell's CSS-variable probes with real px (happy-dom has no
 * layout engine); see `shell-layout.test.tsx` for the full story. */
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

/** Reads and drives the shell by id — mounted as a SIBLING of the shell, so
 * it holds no controller and sits under no shell context. */
function RemoteInspectorControls({ shellId }: { shellId: string }) {
  const { fits, panelWidth, bounds } = useShellFitState(shellId)
  const { resizePanel, resetPanelWidth } = useShellFitActions(shellId)
  return (
    <div>
      <p>{`fits: ${String(fits)}`}</p>
      <p>{`width: ${String(panelWidth)}`}</p>
      <p>{`max: ${bounds.max}`}</p>
      <button onClick={() => resizePanel(360)} type="button">
        Widen
      </button>
      <button onClick={resetPanelWidth} type="button">
        Reset width
      </button>
    </div>
  )
}

function NamedShellUnprovided({ shellId }: { shellId?: string }) {
  const panels = useShellPanels({ shellId })
  return <ShellLayout {...panels.providerProps} panels={PANELS} variant="web" />
}

/** `useShellPanels` reads the same atoms the shell writes, so it has to sit
 * under the same `ExegiaProvider` as the shell — mounted above it, it would
 * read Jotai's default store while the shell writes to the provider's. */
function NamedShell({ shellId }: { shellId?: string }) {
  const panels = useShellPanels({ shellId, defaultPanelWidth: 340 })
  return (
    <>
      <RemoteInspectorControls shellId={panels.shellId} />
      <p>{`hook width: ${String(panels.panelWidth)}`}</p>
      <ShellLayout {...panels.providerProps} panels={PANELS} variant="web" />
    </>
  )
}

describe("shell-fit · by id", () => {
  test("a named shell is readable and resizable from outside it", async () => {
    const user = userEvent.setup()
    const restore = stubShellWidths()
    try {
      // happy-dom's default 1024px viewport: 936 needed. No stylesheet, so the
      // frame measures 0 and the ceiling is 1024 - 256 - 360 = 408.
      render(
        <ExegiaProvider>
          <NamedShell shellId="app-shell" />
        </ExegiaProvider>
      )

      expect(screen.getByText("fits: true")).toBeDefined()
      expect(screen.getByText("max: 408")).toBeDefined()
      // `defaultPanelWidth` seeded the width, and the hook above the provider
      // reads it back out of the same atoms.
      expect(screen.getByText("width: 340")).toBeDefined()
      expect(screen.getByText("hook width: 340")).toBeDefined()

      await user.click(screen.getByRole("button", { name: "Widen" }))
      expect(screen.getByText("width: 360")).toBeDefined()
      expect(screen.getByText("hook width: 360")).toBeDefined()

      await user.click(screen.getByRole("button", { name: "Reset width" }))
      expect(screen.getByText("width: 340")).toBeDefined()
    } finally {
      restore()
      removeShellFitInstance("app-shell")
    }
  })

  test("a generated id is dropped with the hook that made it", () => {
    const restore = stubShellWidths()
    function Probe() {
      const panels = useShellPanels()
      return (
        <ShellLayout {...panels.providerProps} panels={PANELS} variant="web">
          <span data-testid="shell-id">{panels.shellId}</span>
        </ShellLayout>
      )
    }
    try {
      const { unmount } = render(<Probe />)
      const shellId = screen.getByTestId("shell-id").textContent ?? ""
      // No ExegiaProvider here, so the hooks fall back to Jotai's default
      // store — the provider wrote its measurement there under the hook's id.
      const store = getDefaultStore()
      expect(shellId).not.toBe("")
      expect(store.get(shellFitMeasuredAtom(shellId))).not.toBeNull()

      unmount()
      // Nothing is left under it once the hook is gone: the family hands out
      // a fresh atom, and a fresh atom reads as unmeasured.
      expect(store.get(shellFitMeasuredAtom(shellId))).toBeNull()
    } finally {
      restore()
    }
  })

  test("an explicit id outlives the shell", () => {
    const restore = stubShellWidths()
    try {
      const store = getDefaultStore()
      const { unmount } = render(<NamedShellUnprovided shellId="kept" />)
      act(() => {
        store.set(resizeShellPanelAtom("kept"), 360)
      })
      expect(store.get(shellFitRequestedWidthAtom("kept"))).toBe(360)

      unmount()
      // The dragged width is still there for the next mount — a route change
      // does not reset the inspector.
      expect(store.get(shellFitRequestedWidthAtom("kept"))).toBe(360)
    } finally {
      restore()
      removeShellFitInstance("kept")
    }
  })
})
