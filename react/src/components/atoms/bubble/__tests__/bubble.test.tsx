import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Bubble, type BubbleReaction } from "../index"

describe("Bubble", () => {
  test("header renders author, time and a role badge from a string", () => {
    render(
      <Bubble variant="sender">
        <Bubble.Header badge="Admin" name="Sender" time="10 min ago" />
        <Bubble.Message>Hello</Bubble.Message>
      </Bubble>
    )
    expect(screen.getByText("Sender")).toBeDefined()
    expect(screen.getByText("10 min ago")).toBeDefined()
    const badge = screen.getByText("Admin")
    expect(badge.getAttribute("data-variant")).toBe("neutral")
  })

  test("the ai header falls back to the spark mark and the accent badge", () => {
    const { container } = render(
      <Bubble variant="ai">
        <Bubble.Header badge="Agent" name="Exegia" />
        <Bubble.Message>Generated</Bubble.Message>
      </Bubble>
    )
    expect(container.querySelector('[data-slot="bubble-spark"]')).not.toBeNull()
    expect(screen.getByText("Agent").getAttribute("data-variant")).toBe("accent")
  })

  test("reaction chips expose aria-pressed and report toggles by index", async () => {
    const user = userEvent.setup()
    const onToggle = mock((_reaction: BubbleReaction, _index: number) => {})
    render(
      <Bubble variant="recipient">
        <Bubble.Message>Hi</Bubble.Message>
        <Bubble.Reactions
          onToggle={onToggle}
          reactions={[
            { id: "heart", emoji: "❤️", count: 4, reacted: true, label: "heart" },
            { id: "thumbs", emoji: "👍", count: 2, label: "thumbs up" },
          ]}
        />
      </Bubble>
    )
    const heart = screen.getByRole("button", { name: "heart" })
    expect(heart.getAttribute("aria-pressed")).toBe("true")
    expect(heart.textContent).toContain("4")
    const thumbs = screen.getByRole("button", { name: "thumbs up" })
    expect(thumbs.getAttribute("aria-pressed")).toBe("false")
    await user.click(thumbs)
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle.mock.calls[0]?.[1]).toBe(1)
  })

  test("the add-reaction button opens the emoji picker popover", async () => {
    const user = userEvent.setup()
    render(
      <Bubble variant="recipient">
        <Bubble.Message>Hi</Bubble.Message>
        <Bubble.Reactions reactions={[]} />
      </Bubble>
    )
    const trigger = screen.getByRole("button", { name: "Add reaction" })
    expect(document.querySelector('[data-slot="popover-popup"]')).toBeNull()
    await user.click(trigger)
    expect(
      await screen.findByRole("searchbox")
    ).toBeDefined()
    expect(document.querySelector('[data-slot="emoji-picker"]')).not.toBeNull()
  })

  test("root carries the variant for styling hooks", () => {
    const { container } = render(
      <Bubble variant="sender">
        <Bubble.Message>Out</Bubble.Message>
      </Bubble>
    )
    expect(
      container.querySelector('[data-slot="bubble"]')?.getAttribute("data-variant")
    ).toBe("sender")
  })
})
