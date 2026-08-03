import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"

import { UserAvatar, initialsFrom } from "../user-avatar"

describe("initialsFrom", () => {
  test("takes the first and last word", () => {
    expect(initialsFrom("Jenny Hamilton")).toBe("JH")
    expect(initialsFrom("ada  b  lovelace")).toBe("AL")
    expect(initialsFrom("luna")).toBe("L")
    expect(initialsFrom("   ")).toBe("")
  })
})

describe("UserAvatar", () => {
  test("shows initials right away when there is no image", () => {
    const { container } = render(<UserAvatar name="Luna Wyen" />)

    expect(screen.getByText("LW")).toBeDefined()
    expect(container.querySelector('[data-slot="avatar-skeleton"]')).toBeNull()
    expect(container.querySelector("img")).toBeNull()
  })

  test("holds a skeleton while a passed image is still loading", () => {
    // happy-dom resolves every Image synchronously (complete, naturalWidth 0),
    // so stand in a request that never answers.
    const RealImage = window.Image
    window.Image = class {
      complete = false
      naturalWidth = 0
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ""
    } as unknown as typeof window.Image

    try {
      const { container } = render(
        <UserAvatar name="Jenny Hamilton" src="https://example.com/j.jpg" />
      )

      expect(
        container.querySelector('[data-slot="avatar-skeleton"]')
      ).not.toBeNull()
      expect(screen.queryByText("JH")).toBeNull()
      expect(
        container
          .querySelector('[data-slot="user-avatar"]')
          ?.hasAttribute("data-loading")
      ).toBe(true)
    } finally {
      window.Image = RealImage
    }
  })

  test("settles on the initials when the image fails", () => {
    // The stubbed DOM never fetches, so every src lands in the error branch.
    const { container } = render(
      <UserAvatar name="Jenny Hamilton" src="https://example.com/missing.jpg" />
    )

    expect(screen.getByText("JH")).toBeDefined()
    expect(container.querySelector('[data-slot="avatar-skeleton"]')).toBeNull()
  })

  test("loading forces the skeleton over a resolvable image", () => {
    const { container } = render(
      <UserAvatar
        loading
        name="Jenny Hamilton"
        src="https://example.com/j.jpg"
      />
    )

    expect(
      container.querySelector('[data-slot="avatar-skeleton"]')
    ).not.toBeNull()
    expect(container.querySelector("img")).toBeNull()
    expect(screen.queryByText("JH")).toBeNull()
  })

  test("explicit initials win over the derived ones", () => {
    render(<UserAvatar initials="EX" name="Jenny Hamilton" />)
    expect(screen.getByText("EX")).toBeDefined()
  })
})
