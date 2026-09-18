import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import User from "../index"
import { Attachment } from "@/components/composed/chat/attachment"

describe("User.Message", () => {
  test("uses the user's direction and identity for the whole message", () => {
    const { container } = render(
      <User.Message
        variant="info"
        user={{
          firstName: "Marcus",
          lastName: "Lee",
          role: "Reviewer",
          direction: "recipient",
          description: "10 min ago",
        }}
      >
        Compare the passage.
      </User.Message>
    )
    expect(
      container
        .querySelector('[data-slot="bubble"]')
        ?.getAttribute("data-variant")
    ).toBe("recipient")
    expect(screen.getByText("Marcus Lee")).toBeDefined()
    expect(screen.getByText("Reviewer")).toBeDefined()
    expect(screen.getByText("10 min ago")).toBeDefined()
    expect(
      screen
        .getByText("Compare the passage.")
        .closest('[data-slot="bubble-message"]')
    ).not.toBeNull()
  })

  test("continued messages omit the identity and keep reactions outside the surface", () => {
    const { container } = render(
      <User.Message
        variant="info"
        continued
        user={{ firstName: "Jenny", direction: "sender" }}
        reactions={{ reactions: [{ emoji: "❤️", label: "heart", count: 1 }] }}
      >
        A follow-up.
      </User.Message>
    )
    expect(container.querySelector('[data-slot="bubble-header"]')).toBeNull()
    expect(
      container
        .querySelector('[data-slot="bubble"]')
        ?.hasAttribute("data-continued")
    ).toBe(true)
    expect(
      screen
        .getByRole("button", { name: "heart" })
        .closest('[data-slot="bubble-message"]')
    ).toBeNull()
  })

  test("attachment-only user messages retain the bare attachment surface", () => {
    const { container } = render(
      <User.Message
        variant="info"
        user={{ firstName: "Jenny", direction: "sender" }}
      >
        <Attachment kind="image" title="scan.jpg" src="/scan.jpg" />
      </User.Message>
    )
    expect(
      container
        .querySelector('[data-slot="bubble-message"]')
        ?.hasAttribute("data-unstyled")
    ).toBe(true)
    expect(
      container.querySelector('[data-slot="preview-card-trigger"]')
    ).not.toBeNull()
  })
})
