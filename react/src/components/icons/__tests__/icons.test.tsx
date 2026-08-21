import { describe, expect, test } from "bun:test"
import { render } from "@testing-library/react"

import * as icons from ".."

const components = Object.entries(icons).filter(
  ([name]) => name.startsWith("FileBadge") || name.startsWith("FileWordmark")
) as [string, (props: Record<string, unknown>) => React.ReactElement][]

describe("file icons", () => {
  test("exports all fourteen components", () => {
    expect(components).toHaveLength(14)
  })

  for (const [name, Icon] of components) {
    test(`${name} renders both theme layers on Tailwind's dark variant`, () => {
      const { container } = render(<Icon />)
      const svg = container.querySelector("svg")
      expect(svg?.getAttribute("width")).toBe("64")
      expect(svg?.getAttribute("role")).toBe("img")

      const light = svg?.querySelector('[data-theme-layer="light"]')
      const dark = svg?.querySelector('[data-theme-layer="dark"]')
      expect(light?.getAttribute("class")).toBe("dark:hidden")
      expect(dark?.getAttribute("class")).toBe("hidden dark:inline")
      // No inline stylesheet — switching belongs to the app's Tailwind build.
      expect(svg?.querySelector("style")).toBeNull()
    })

    test(`${name}'s internal references all resolve`, () => {
      const { container } = render(<Icon />)
      const svg = container.querySelector("svg")!
      const ids = new Set(
        [...svg.querySelectorAll("[id]")].map((el) => el.getAttribute("id"))
      )
      const refs = [
        ...[...svg.querySelectorAll("use")].map((el) =>
          el.getAttribute("href")?.slice(1)
        ),
        ...[...svg.outerHTML.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]),
      ]
      expect(refs.length).toBeGreaterThan(0)
      for (const ref of refs) expect(ids.has(ref ?? "")).toBe(true)
    })
  }

  test("title becomes the accessible name; null marks decorative", () => {
    const named = render(<icons.FileBadgeTei title="TEI source" />)
    expect(
      named.container.querySelector("svg")?.getAttribute("aria-label")
    ).toBe("TEI source")

    const decorative = render(<icons.FileWordmarkPdf title={null} />)
    const svg = decorative.container.querySelector("svg")
    expect(svg?.getAttribute("role")).toBe("presentation")
    expect(svg?.getAttribute("aria-hidden")).toBe("true")
  })
})
