import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glasscn/glass-container"
import type { TFrostGlassVariant } from "@/lib/glass-variants"

afterEach(cleanup)

describe("library glass material", () => {
  for (const glassVariant of ["clear", "frosted", "subtle", "liquid", "liquid-refract"] as TFrostGlassVariant[]) {
    test(`${glassVariant} keeps the button as the interactive root`, () => {
      let clicks = 0
      const { container } = render(<Button variant="glass" glassVariant={glassVariant} onClick={() => clicks++}>Save</Button>)
      const button = screen.getByRole("button", { name: "Save" })
      expect(container.firstElementChild).toBe(button)
      expect(button.querySelector('[data-liquid-glass="material"]')).toBeTruthy()
      fireEvent.click(button)
      expect(clicks).toBe(1)
    })
  }

  test("container forwards refs and attributes to the content host", () => {
    const ref = createRef<HTMLDivElement>()
    render(<GlassContainer ref={ref} role="region" aria-label="Details"><button>Inspect</button></GlassContainer>)
    expect(ref.current).toBe(screen.getByRole("region", { name: "Details" }))
    expect(ref.current?.querySelectorAll('[data-liquid-glass="material"]').length).toBe(1)
    expect(screen.getByRole("button", { name: "Inspect" })).toBeTruthy()
  })
})
