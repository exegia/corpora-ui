import { describe, expect, mock, test } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "jotai"
import userEvent from "@testing-library/user-event"

import { Composer, type TComposerAttachment } from "../composer"

const SEED: TComposerAttachment[] = [
  { id: "a", kind: "document", title: "Q3.pdf", meta: "PDF" },
  { id: "b", kind: "image", title: "IMG.jpg" },
]

describe("Composer attachments", () => {
  test("renders the tray, removes a chip and sends with ⌘↵", async () => {
    const onSubmit = mock(() => {})
    render(
      <Provider>
        <Composer
          attachments={SEED}
          defaultValue="hello"
          onSubmit={onSubmit}
          safetyNote={null}
        />
      </Provider>
    )
    // The tray seeds from a passive effect; flush the re-render it schedules.
    await act(async () => {})
    expect(screen.getAllByRole("button", { name: "Remove" }).length).toBe(2)
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0])
    expect(screen.queryByText("Q3.pdf")).toBeNull()

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Message" }), {
      key: "Enter",
      metaKey: true,
    })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    const [draft, , attachments] = onSubmit.mock.calls[0] as unknown as [
      string,
      string,
      TComposerAttachment[],
    ]
    expect(draft).toBe("hello")
    expect(attachments.map((a) => a.id)).toEqual(["b"])
  })

  test("empty tray renders no tray row", () => {
    const { container } = render(
      <Provider>
        <Composer safetyNote={null} />
      </Provider>
    )
    expect(container.querySelector('[data-slot="composer-tray"]')).toBeNull()
  })

  test("selects local files and submits an attachment-only message once", async () => {
    const user = userEvent.setup()
    const onSubmit = mock(() => {})
    const onFilesChange = mock(() => {})
    render(
      <Provider>
        <Composer onSubmit={onSubmit} onFilesChange={onFilesChange} />
      </Provider>
    )
    const file = new File(["passage"], "passage.txt", { type: "text/plain" })
    await user.upload(screen.getByLabelText("Attach files"), file)
    expect(onFilesChange).toHaveBeenCalledWith([file])
    expect(screen.getByText("passage.txt")).toBeDefined()
    await user.click(screen.getByRole("button", { name: "Send message" }))
    expect(onSubmit).toHaveBeenCalledWith("", "answer", [
      expect.objectContaining({ file, title: "passage.txt" }),
    ])
    expect(screen.queryByText("passage.txt")).toBeNull()
    expect(
      screen
        .getByRole("button", { name: "Send message" })
        .hasAttribute("disabled")
    ).toBe(true)
  })

  test("preserves image, video and audio file types when sending", async () => {
    const user = userEvent.setup()
    const onSubmit = mock(() => {})
    render(
      <Provider>
        <Composer onSubmit={onSubmit} />
      </Provider>
    )
    const files = [
      new File(["image"], "scan.JPG"),
      new File(["video"], "lecture.mp4", { type: "video/mp4" }),
      new File(["audio"], "reading.m4a", { type: "audio/mp4" }),
    ]
    await user.upload(screen.getByLabelText("Attach files"), files)
    await user.click(screen.getByRole("button", { name: "Send message" }))
    expect(onSubmit).toHaveBeenCalledWith("", "answer", [
      expect.objectContaining({ kind: "image", file: files[0] }),
      expect.objectContaining({ kind: "media", audio: false, file: files[1] }),
      expect.objectContaining({ kind: "media", audio: true, file: files[2] }),
    ])
  })
})
