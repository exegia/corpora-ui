import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AiMessage } from "../index"

// The Composer's own tests moved with it to
// `composed/chat/__tests__/composer.test.tsx`. The SuggestionCard tests left
// with the component (removed in b8bb887); proposals now render through
// `Recommendation` cards from composed/chat.

describe("AiMessage", () => {
  test("toggles the suggestions disclosure", async () => {
    const user = userEvent.setup()
    render(
      <AiMessage
        user={{ firstName: "Exegia", role: "Agent" }}
        suggestions={
          <>
            <div key="1">One</div>
            <div key="2">Two</div>
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
        user={{ firstName: "Exegia", role: "Agent" }}
        suggestions={
          <>
            <div key="1">One</div>
            <div key="2">Two</div>
          </>
        }
        suggestionsLabel={(count) => `Suggestions (${count})`}
      >
        Generated prose
      </AiMessage>
    )
    expect(
      screen.getByRole("button", { name: "Suggestions (2)" })
    ).toBeDefined()
  })
})
