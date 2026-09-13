import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  ScopeChip,
  SelectionPopover,
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
})
