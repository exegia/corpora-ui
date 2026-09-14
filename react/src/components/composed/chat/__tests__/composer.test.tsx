import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "jotai"

import {
  CommandMenu,
  Composer,
  SuggestedPrompts,
  type ComposerSuggestionsProps,
} from "../composer"
import { SuggestedPrompt } from "@/components/composed/ai/suggested-prompt"

describe("Composer", () => {
  test("rests as a pill with the send hint and expands on focus", async () => {
    const user = userEvent.setup()
    const onSubmit = mock(() => {})
    render(
      <Provider>
        <Composer
          ComposerMenu={() => <CommandMenu items={[]} />}
          onSubmit={onSubmit}
          safetyNote={null}
        />
      </Provider>
    )

    expect(screen.getByText("to send message")).toBeDefined()
    expect(screen.queryByRole("button", { name: "Send message" })).toBeNull()

    const field = screen.getByRole("textbox", { name: "Message" })
    await user.click(field)
    expect(
      await screen.findByRole("button", { name: "Send message" })
    ).toBeDefined()
    expect(screen.getByRole("button", { name: "Add attachment" })).toBeDefined()

    await user.type(field, "Validate ¶12")
    await user.keyboard("{Meta>}{Enter}{/Meta}")
    expect(onSubmit).toHaveBeenCalledWith("Validate ¶12", "answer", [])
  })

  test("folds the suggested prompts behind the disclosure and routes a pick", async () => {
    const user = userEvent.setup()
    const onSelect = mock(() => {})
    const Suggestions = (props: ComposerSuggestionsProps) => (
      <SuggestedPrompts onOpenChange={props.onOpenChange} open={props.open}>
        <SuggestedPrompt onSelect={onSelect}>Check ¶12</SuggestedPrompt>
      </SuggestedPrompts>
    )
    render(
      <Provider>
        <Composer safetyNote={null} Suggestions={Suggestions} />
      </Provider>
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
    render(
      <Provider>
        <Composer expanded isStreaming onStop={onStop} safetyNote={null} />
      </Provider>
    )
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
