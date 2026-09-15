import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TextClickPopover } from "../click-popover"

describe("text click popover", () => {
  test("clicking the text opens the popover content", async () => {
    const user = userEvent.setup()
    render(
      <TextClickPopover popover={<p>Popover body</p>} size="small">
        Clickable span
      </TextClickPopover>
    )

    expect(screen.queryByText("Popover body")).toBeNull()

    await user.click(screen.getByText("Clickable span"))
    expect(await screen.findByText("Popover body")).toBeTruthy()
  })

  test("keeps the text element semantics for link and subscript", async () => {
    const user = userEvent.setup()
    render(
      <>
        <TextClickPopover popover={<p>Link body</p>} type="link">
          Link text
        </TextClickPopover>
        <TextClickPopover popover={<p>Subscript body</p>} type="subscript">
          Subscript note
        </TextClickPopover>
      </>
    )

    expect(screen.getByText("Link text").tagName).toBe("A")
    expect(screen.getByText("Subscript note").tagName).toBe("SUB")

    await user.click(screen.getByText("Subscript note"))
    expect(await screen.findByText("Subscript body")).toBeTruthy()
  })

  test("renderPopover receives close and dismisses the popup", async () => {
    const user = userEvent.setup()
    render(
      <TextClickPopover
        renderPopover={({ close }) => (
          <button onClick={close} type="button">
            Dismiss
          </button>
        )}
      >
        Clickable text
      </TextClickPopover>
    )

    await user.click(screen.getByText("Clickable text"))
    const dismiss = await screen.findByText("Dismiss")

    await user.click(dismiss)
    expect(screen.queryByText("Dismiss")).toBeNull()
  })
})
