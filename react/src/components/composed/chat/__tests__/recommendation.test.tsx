import { describe, expect, mock, test } from "bun:test"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { RecommendationCard } from "../recommendation"

describe("Recommendation content", () => {
  test("collapses the description and its pills with the body while keeping the title available", async () => {
    const user = userEvent.setup()
    const onAccept = mock(() => {})
    render(
      <RecommendationCard
        title="Validate this corpus"
        description="Check the section features in"
        entity={{ name: "Iliad", initials: "I" }}
        leadTime="2 min"
        defaultOpen={false}
        onAccept={onAccept}
      />
    )
    const trigger = screen.getByRole("button", { name: "Validate this corpus" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByText("Check the section features in")).toBeNull()
    expect(screen.queryByText("Iliad")).toBeNull()
    expect(screen.queryByText("2 min")).toBeNull()

    await user.click(trigger)
    const description = await screen.findByText(
      "Check the section features in",
      { exact: false }
    )
    expect(description.closest('[data-slot="accordion-panel"]')).not.toBeNull()
    expect(within(trigger).queryByText("Iliad")).toBeNull()
    expect(screen.getByText("Iliad")).toBeDefined()
    expect(screen.getByText("2 min")).toBeDefined()
    await user.click(screen.getByRole("button", { name: "Accept" }))
    expect(onAccept).toHaveBeenCalledTimes(1)

    await user.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    await waitFor(() => expect(screen.queryByText("Iliad")).toBeNull())
  })
})
