import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"

import { Logo } from "../logo"

const root = () => document.querySelector<HTMLElement>('[data-slot="logo"]')
const wordmark = () =>
  document.querySelector<HTMLElement>('[data-slot="logo-wordmark"]')
const monogram = () =>
  document.querySelector<HTMLElement>('[data-slot="logo-monogram"]')

describe("Logo", () => {
  test("defaults: monogram tile from the name, name as the wordmark", () => {
    render(<Logo name="Corpora Codex" />)
    expect(monogram()?.textContent).toBe("CC")
    expect(wordmark()?.textContent).toBe("Corpora Codex")
    expect(root()?.tagName).toBe("SPAN")
    expect(root()?.getAttribute("data-variant")).toBe("full")
  })

  test("a custom mark wins over src; src renders a decorative image", () => {
    const { rerender } = render(
      <Logo name="Corpora" src="https://example.com/mark.png" />
    )
    expect(monogram()).toBeNull()
    expect(document.querySelector("img")?.getAttribute("alt")).toBe("")
    rerender(
      <Logo
        name="Corpora"
        src="https://example.com/mark.png"
        mark={<svg data-testid="mark" />}
      />
    )
    expect(document.querySelector("img")).toBeNull()
    expect(screen.getByTestId("mark")).toBeTruthy()
  })

  test("href renders a link named for AT regardless of variant", () => {
    render(<Logo name="Corpora" href="/" variant="mark" />)
    const link = screen.getByRole("link", { name: "Corpora" })
    expect(link.getAttribute("href")).toBe("/")
    expect(link.getAttribute("data-slot")).toBe("logo")
  })

  test("variant=mark folds the wordmark: hidden from AT, root keeps the name", () => {
    const { rerender } = render(<Logo name="Corpora" variant="mark" />)
    expect(wordmark()?.getAttribute("aria-hidden")).toBe("true")
    expect(root()?.getAttribute("aria-label")).toBe("Corpora")
    expect(root()?.getAttribute("data-variant")).toBe("mark")
    // Unfolded, the visible wordmark is the name — no double label.
    rerender(<Logo name="Corpora" variant="full" />)
    expect(wordmark()?.getAttribute("aria-hidden")).toBeNull()
    expect(root()?.getAttribute("aria-label")).toBeNull()
  })

  test("a custom wordmark replaces the name text", () => {
    render(<Logo name="Corpora" wordmark={<span>corpora/ui</span>} />)
    expect(wordmark()?.textContent).toBe("corpora/ui")
  })
})
