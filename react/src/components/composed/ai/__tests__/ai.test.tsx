import { describe, expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AiMessage, Composer, SuggestedPrompt, SuggestionCard } from "../index"

describe("Composer", () => {
  test("rests as a pill with the send hint and expands on focus", async () => {
    const user = userEvent.setup()
    const onSend = mock(() => {})
    const onAttach = mock(() => {})
    render(<Composer onAttach={onAttach} onSend={onSend} safetyNote={null} />)

    expect(screen.getByText("to send message")).toBeDefined()
    expect(screen.queryByRole("button", { name: "Send message" })).toBeNull()

    const field = screen.getByRole("textbox", { name: "Message" })
    await user.click(field)
    expect(await screen.findByRole("button", { name: "Send message" })).toBeDefined()

    await user.type(field, "Validate ¶12")
    await user.keyboard("{Meta>}{Enter}{/Meta}")
    expect(onSend).toHaveBeenCalledWith("Validate ¶12", "answer", [])

    await user.click(screen.getByRole("button", { name: "Attach" }))
    expect(onAttach).toHaveBeenCalledTimes(1)
  })

  test("folds the suggested prompts behind the disclosure and routes a pick", async () => {
    const user = userEvent.setup()
    const onSelect = mock(() => {})
    render(
      <Composer
        safetyNote={null}
        suggestedPrompts={
          <SuggestedPrompt onSelect={onSelect}>Check ¶12</SuggestedPrompt>
        }
      />
    )

    const trigger = screen.getByRole("button", { name: /Suggestions \(1\)/ })
    expect(trigger.getAttribute("aria-expanded")).toBe("true")

    await user.click(await screen.findByRole("button", { name: /Check ¶12/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)

    // Only the disclosure state is asserted: the panel leaves through an
    // AnimatePresence exit, and happy-dom's stubbed `Element.animate` never
    // finishes it, so the row stays mounted here but not in a browser.
    await user.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
  })

  test("shows Stop while streaming and routes it to onStop", async () => {
    const user = userEvent.setup()
    const onStop = mock(() => {})
    render(<Composer expanded isStreaming onStop={onStop} safetyNote={null} />)
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})

describe("SuggestionCard", () => {
  test("reveals the reference chip with the body and links it to the node", async () => {
    const user = userEvent.setup()
    render(
      <SuggestionCard
        defaultOpen={false}
        description="Label mismatch"
        heading="Suggestion"
        reference={{ id: "p-17", title: "Reference 1", url: "#p-17" }}
      >
        Body copy
      </SuggestionCard>
    )
    // The chip lives in the card body, not the folded header — a link inside
    // the trigger would nest an <a> in a <button>.
    const trigger = screen.getByRole("button", { name: /Suggestion/ })
    expect(screen.queryByText("Reference 1")).toBeNull()
    expect(screen.queryByText("Body copy")).toBeNull()

    await user.click(trigger)
    expect(await screen.findByText("Body copy")).toBeDefined()
    await waitFor(() => {
      const chip = screen.getByText("Reference 1")
      expect(trigger.contains(chip)).toBe(false)
      expect(chip.closest("a")?.getAttribute("href")).toBe("#p-17")
    })
  })

  test("renders one chip per reference when given several", async () => {
    render(
      <SuggestionCard
        heading="Suggestion"
        reference={[
          { id: "p-17", title: "Reference 1" },
          { id: "p-18", title: "Reference 2" },
        ]}
      />
    )
    expect(await screen.findByText("Reference 1")).toBeDefined()
    expect(screen.getByText("Reference 2")).toBeDefined()
  })

  test("uses the design's action labels and reports the outcome", async () => {
    const user = userEvent.setup()
    const onAccept = mock(() => {})
    const onReject = mock(() => {})
    const { rerender } = render(
      <SuggestionCard
        heading="Suggestion"
        onAccept={onAccept}
        onReject={onReject}
      />
    )
    await user.click(screen.getByRole("button", { name: "Ok, fix" }))
    expect(onAccept).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole("button", { name: "Ignore" }))
    expect(onReject).toHaveBeenCalledTimes(1)

    const onUndo = mock(() => {})
    rerender(
      <SuggestionCard heading="Suggestion" onUndo={onUndo} state="rejected" />
    )
    expect(await screen.findByText("Skipped")).toBeDefined()
    // The actions leave through an AnimatePresence exit; Undo takes their slot
    // once it finishes.
    const undo = await screen.findByRole("button", { name: /Undo/ })
    expect(screen.queryByRole("button", { name: "Ignore" })).toBeNull()
    await user.click(undo)
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onReject).toHaveBeenCalledTimes(1)
  })

  // The rejected path above is not enough: accepted is the other half of the
  // `mode="wait"` swap and the only user of `STATE_ICON.accepted`.
  test("swaps the actions for the accepted outcome", async () => {
    const { rerender } = render(<SuggestionCard heading="Suggestion" />)
    expect(screen.getByRole("button", { name: "Ok, fix" })).toBeDefined()

    rerender(
      <SuggestionCard heading="Suggestion" onUndo={() => {}} state="accepted" />
    )
    expect(await screen.findByText("Done")).toBeDefined()
    // Undo only mounts once the actions have finished leaving, so it is the
    // signal that the swap completed — the badge alone lands a frame early.
    expect(await screen.findByRole("button", { name: /Undo/ })).toBeDefined()
    expect(screen.queryByRole("button", { name: "Ok, fix" })).toBeNull()
  })
})

describe("AiMessage", () => {
  test("toggles the suggestions disclosure", async () => {
    const user = userEvent.setup()
    render(
      <AiMessage
        author="Exegia"
        suggestions={
          <>
            <SuggestionCard heading="One" key="1" />
            <SuggestionCard heading="Two" key="2" />
          </>
        }
        time="2 min ago"
      >
        Generated prose
      </AiMessage>
    )
    expect(screen.getByText("Agent")).toBeDefined()
    // The default label is bare — the cards land right under the trigger, so
    // the tally would only be noise. `suggestionsLabel` is the way back to it.
    const trigger = screen.getByRole("button", { name: "Suggestions" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("One")).toBeNull()

    await user.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(await screen.findByText("One")).toBeDefined()
    expect(await screen.findByText("Two")).toBeDefined()
  })

  test("still counts the cards, for a label that asks for the tally", () => {
    render(
      <AiMessage
        author="Exegia"
        suggestions={
          <>
            <SuggestionCard heading="One" key="1" />
            <SuggestionCard heading="Two" key="2" />
          </>
        }
        suggestionsLabel={(count) => `Suggestions (${count})`}
      >
        Generated prose
      </AiMessage>
    )
    expect(screen.getByRole("button", { name: "Suggestions (2)" })).toBeDefined()
  })
})
