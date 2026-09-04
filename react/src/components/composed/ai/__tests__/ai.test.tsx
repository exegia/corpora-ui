import { describe, expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AiMessage, Composer, ReferenceChip, SuggestionCard } from "../index"

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
    expect(onSend).toHaveBeenCalledWith("Validate ¶12", "answer")

    await user.click(screen.getByRole("button", { name: "Attach" }))
    expect(onAttach).toHaveBeenCalledTimes(1)
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
  test("keeps the reference in the header while folded and moves it into the body when open", async () => {
    const user = userEvent.setup()
    render(
      <SuggestionCard
        defaultOpen={false}
        description="Label mismatch"
        heading="Suggestion"
        nodeId="p-17"
        reference={<ReferenceChip href="#p-17">Reference 1</ReferenceChip>}
      >
        Body copy
      </SuggestionCard>
    )
    const trigger = screen.getByRole("button", { name: /Suggestion/ })
    expect(trigger.contains(screen.getByText("Reference 1"))).toBe(true)
    expect(screen.queryByText("Body copy")).toBeNull()

    await user.click(trigger)
    expect(await screen.findByText("Body copy")).toBeDefined()
    await waitFor(() => {
      const chips = screen.getAllByText("Reference 1")
      expect(chips.some((chip) => !trigger.contains(chip))).toBe(true)
    })
  })

  test("uses the design's action labels and reports the outcome", async () => {
    const user = userEvent.setup()
    const onAccept = mock(() => {})
    const onReject = mock(() => {})
    const { rerender } = render(
      <SuggestionCard
        heading="Suggestion"
        nodeId="p-17"
        onAccept={onAccept}
        onReject={onReject}
      />
    )
    await user.click(screen.getByRole("button", { name: "Ok, fix them" }))
    expect(onAccept).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole("button", { name: "Ignore" }))
    expect(onReject).toHaveBeenCalledTimes(1)

    rerender(<SuggestionCard heading="Suggestion" nodeId="p-17" state="rejected" />)
    expect(await screen.findByText("Ignored")).toBeDefined()
    expect(screen.queryByRole("button", { name: "Ignore" })).toBeNull()
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
            <SuggestionCard heading="One" key="1" nodeId="p-1" />
            <SuggestionCard heading="Two" key="2" nodeId="p-2" />
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
            <SuggestionCard heading="One" key="1" nodeId="p-1" />
            <SuggestionCard heading="Two" key="2" nodeId="p-2" />
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
