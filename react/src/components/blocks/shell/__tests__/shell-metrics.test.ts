import { describe, expect, test } from "bun:test"

import {
  clampPanelWidth,
  fitsPanel,
  metricsEqual,
  panelBounds,
  requiredWidth,
  type ShellMetrics,
} from "../shell-metrics"

/** The columns the shell ships with: rail 256 (56 folded), body floor 360,
 * secondary panel floor 320 — 936px before a panel can exist — plus the 32px
 * of shell padding and column gaps that only the ceiling pays for. */
function shell(over: Partial<ShellMetrics> = {}): ShellMetrics {
  return {
    rail: 256,
    insetMin: 360,
    panelMin: 320,
    viewport: 1024,
    chrome: 32,
    ...over,
  }
}

describe("fitsPanel", () => {
  test("wants the rail plus both floors to clear the viewport", () => {
    expect(requiredWidth(shell())).toBe(936)
    expect(fitsPanel(shell())).toBe(true)
    expect(fitsPanel(shell({ viewport: 800 }))).toBe(false)
  })

  test("is strict — a viewport that fits exactly has nothing left to give", () => {
    expect(fitsPanel(shell({ viewport: 936 }))).toBe(false)
    expect(fitsPanel(shell({ viewport: 937 }))).toBe(true)
  })

  test("a folded rail hands its column back", () => {
    expect(fitsPanel(shell({ rail: 56, viewport: 800 }))).toBe(true)
  })

  test("a shell with no rail spends nothing on one", () => {
    expect(fitsPanel(shell({ rail: 0, viewport: 700 }))).toBe(true)
  })

  test("an unmeasurable shell fails open rather than hiding the panel", () => {
    expect(
      fitsPanel({
        rail: 0,
        insetMin: 0,
        panelMin: 0,
        viewport: 0,
        chrome: 0,
      })
    ).toBe(true)
    expect(fitsPanel(shell({ panelMin: 0 }))).toBe(true)
  })

  test("ignores the shell's own frame — the rule is stated on the viewport", () => {
    expect(fitsPanel(shell({ chrome: 0 }))).toBe(
      fitsPanel(shell({ chrome: 300 }))
    )
  })
})

describe("panelBounds", () => {
  test("the panel may take every px the body holds above its floor", () => {
    // 1024 - 32 frame - 256 rail - 360 body floor.
    expect(panelBounds(shell())).toEqual({ min: 320, max: 376 })
    expect(panelBounds(shell({ rail: 56 })).max).toBe(576)
  })

  test("the shell's frame comes out of the ceiling, not the floor", () => {
    expect(panelBounds(shell({ chrome: 0 })).max).toBe(408)
    expect(panelBounds(shell({ chrome: 0 })).min).toBe(320)
  })

  test("never inverts — a shell with no room reports its floor twice", () => {
    expect(panelBounds(shell({ viewport: 800 }))).toEqual({
      min: 320,
      max: 320,
    })
  })
})

describe("clampPanelWidth", () => {
  test("holds a drag inside the bounds and leaves the middle alone", () => {
    expect(clampPanelWidth(600, shell())).toBe(376)
    expect(clampPanelWidth(100, shell())).toBe(320)
    expect(clampPanelWidth(360, shell())).toBe(360)
  })

  test("a narrowing viewport pulls a resized panel back down", () => {
    const resized = clampPanelWidth(500, shell({ rail: 56 }))
    expect(resized).toBe(500)
    expect(clampPanelWidth(resized, shell({ rail: 56, viewport: 900 }))).toBe(
      452
    )
  })
})

describe("metricsEqual", () => {
  test("compares fields, so a fresh object off the same layout is quiet", () => {
    expect(metricsEqual(shell(), shell())).toBe(true)
    expect(metricsEqual(shell(), shell({ viewport: 1025 }))).toBe(false)
    expect(metricsEqual(shell(), shell({ rail: 56 }))).toBe(false)
  })
})
