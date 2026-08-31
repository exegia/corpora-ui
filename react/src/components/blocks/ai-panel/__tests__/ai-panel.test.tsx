import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  GeneratedBlock,
  ScopeChip,
  ScopePicker,
  SelectionPopover,
  SuggestionCard,
  type AiScope,
} from "../index"

const passageScope: AiScope = {
  kind: "passage",
  label: "a.1",
  range: "¶1–¶2",
  nodeIds: ["p-1", "p-2"],
}

describe("AI curation component set", () => {
  test("keeps the word popover content and appends one Add to chat action", async () => {
    const onAddToChat = mock(() => {})
    const user = userEvent.setup()
    render(
      <SelectionPopover
        open
        onAddToChat={onAddToChat}
        variant="word"
        word={{
          lemma: "doctrina",
          partOfSpeech: "noun",
          frequency: 12,
          onViewDetails: mock(() => {}),
        }}
      >
        <span>doctrina in context</span>
      </SelectionPopover>
    )

    expect(screen.getByText("doctrina")).toBeDefined()
    expect(screen.getByText("noun · 12×")).toBeDefined()
    expect(screen.getByRole("button", { name: /View details/ })).toBeDefined()
    expect(screen.getAllByRole("button", { name: /Add to chat/ })).toHaveLength(
      1
    )
    await user.click(screen.getByRole("button", { name: /Add to chat/ }))
    expect(onAddToChat).toHaveBeenCalledTimes(1)
  })

  test("renders range and pinned chip states", () => {
    const { rerender } = render(<ScopeChip removable scope={passageScope} />)
    expect(screen.getByText("a.1 ¶1–¶2 · passage")).toBeDefined()

    rerender(
      <ScopeChip
        scope={{ kind: "passage", label: "a.1 ¶1–¶2", pinned: true }}
      />
    )
    expect(screen.getByText("PINNED · a.1 ¶1–¶2")).toBeDefined()
  })

  test("scope picker exposes the exact keyboard-operable node ladder", async () => {
    const user = userEvent.setup()
    const onValueChange = mock(() => {})
    render(
      <ScopePicker
        defaultOpen
        defaultValue="word"
        onValueChange={onValueChange}
      />
    )

    expect(screen.getAllByRole("option")).toHaveLength(5)
    expect(
      screen.getByRole("option", { name: "word" }).getAttribute("aria-selected")
    ).toBe("true")
    await user.click(screen.getByRole("option", { name: "corpus" }))
    expect(onValueChange).toHaveBeenCalledWith("corpus")
  })

  test("suggestion card offers accept and reject only while pending", async () => {
    const user = userEvent.setup()
    const onAccept = mock(() => {})
    const onReject = mock(() => {})
    const { rerender } = render(
      <SuggestionCard
        heading="Label mismatch"
        nodeId="p-17"
        onAccept={onAccept}
        onReject={onReject}
      >
        <p>label: paragraph → p</p>
      </SuggestionCard>
    )

    expect(screen.getByText("p-17")).toBeDefined()
    await user.click(screen.getByRole("button", { name: "Accept" }))
    expect(onAccept).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole("button", { name: "Reject" }))
    expect(onReject).toHaveBeenCalledTimes(1)

    rerender(
      <SuggestionCard heading="Label mismatch" nodeId="p-17" state="accepted">
        <p>label: paragraph → p</p>
      </SuggestionCard>
    )
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull()
    expect(screen.getByText("Accepted")).toBeDefined()
  })

  test("suggestion card collapses its panel from the heading trigger", async () => {
    const user = userEvent.setup()
    render(
      <SuggestionCard heading="Label mismatch" nodeId="p-17">
        <p>label: paragraph → p</p>
      </SuggestionCard>
    )

    const trigger = screen.getByRole("button", { name: /Label mismatch/ })
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    await user.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
  })

  test("marks generated streaming output as a polite live region", () => {
    render(<GeneratedBlock content="Checking node p-17…" isStreaming />)
    const liveRegion = screen
      .getByText("Checking node p-17…")
      .closest("[aria-live]")
    expect(liveRegion?.getAttribute("aria-live")).toBe("polite")
    expect(screen.getByText("GENERATED · NOT PART OF THE CORPUS")).toBeDefined()
    expect(screen.getByRole("button", { name: "Stop" })).toBeDefined()
  })
})
