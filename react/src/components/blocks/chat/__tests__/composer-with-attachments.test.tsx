import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "jotai"

import { ComposerWithAttachments, type ComposerAttachment } from "../index"

const SEED: ComposerAttachment[] = [
  { id: "a", kind: "document", title: "Q3.pdf", meta: "PDF" },
  { id: "b", kind: "image", title: "IMG.jpg" },
]

describe("ComposerWithAttachments", () => {
  test("renders the tray, removes a chip and sends with ⌘↵", () => {
    const onSend = mock(() => {})
    render(
      <Provider>
        <ComposerWithAttachments defaultAttachments={SEED} defaultValue="hello" onSend={onSend} />
      </Provider>
    )
    expect(screen.getAllByRole("button", { name: "Remove" }).length).toBe(2)
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0])
    expect(screen.queryByText("Q3.pdf")).toBeNull()

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Message" }), { key: "Enter", metaKey: true })
    expect(onSend).toHaveBeenCalledTimes(1)
    const [draft, attachments] = onSend.mock.calls[0] as unknown as [string, ComposerAttachment[]]
    expect(draft).toBe("hello")
    expect(attachments.map((a) => a.id)).toEqual(["b"])
  })

  test("empty tray renders no tray row", () => {
    const { container } = render(
      <Provider>
        <ComposerWithAttachments />
      </Provider>
    )
    expect(container.querySelector('[data-slot="composer-tray"]')).toBeNull()
  })
})
