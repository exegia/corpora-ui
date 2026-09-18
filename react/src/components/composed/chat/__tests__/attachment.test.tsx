import { describe, expect, mock, spyOn, test } from "bun:test"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"

import { Attachment } from "../attachment"

describe("Attachment", () => {
  test("chip shows title + meta and fires onRemove", () => {
    const onRemove = mock(() => {})
    render(
      <Attachment
        kind="document"
        title="Q3.pdf"
        meta="PDF · 2.4 MB"
        onRemove={onRemove}
      />
    )
    expect(screen.getByText("Q3.pdf")).toBeDefined()
    expect(screen.getByText("PDF · 2.4 MB")).toBeDefined()
    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  test("removable={false} hides the ✕", () => {
    render(
      <Attachment
        kind="image"
        title="a.jpg"
        onRemove={() => {}}
        removable={false}
      />
    )
    expect(screen.queryByRole("button", { name: "Remove" })).toBeNull()
  })

  test("preview renders per kind", () => {
    const { container } = render(
      <>
        <Attachment
          kind="media"
          variant="preview"
          title="clip"
          duration="0:42"
        />
        <Attachment
          kind="url-link"
          variant="preview"
          title="Exegia"
          domain="sketch.com"
        />
      </>
    )
    expect(screen.getByRole("button", { name: "Play" })).toBeDefined()
    expect(screen.getByText("0:42")).toBeDefined()
    expect(container.querySelectorAll('[data-variant="preview"]').length).toBe(
      2
    )
  })

  test("previewable chip shows its preview on hover / focus", async () => {
    render(
      <Attachment
        kind="text-selection"
        title="Iliad · Book 1, §12"
        quote="the will of Zeus"
      />
    )
    expect(screen.queryByText("the will of Zeus")).toBeNull()
    const chip = screen
      .getByText("Iliad · Book 1, §12")
      .closest("[data-slot=attachment]")!
    await act(async () => {
      fireEvent.focus(chip)
      fireEvent.mouseEnter(chip)
      fireEvent.mouseMove(chip)
      await new Promise((r) => setTimeout(r, 400))
    })
    expect(await screen.findByText("the will of Zeus")).toBeDefined()
  })

  test("documents and sent user handles have keyboard-focus previews", async () => {
    const document = render(
      <Attachment
        kind="document"
        title="notes.txt"
        previewText="Compare the manuscript witnesses."
      />
    )
    fireEvent.focus(
      document.container.querySelector('[data-slot="preview-card-trigger"]')!
    )
    await waitFor(() =>
      expect(
        document.baseElement.querySelector(
          '[data-slot="attachment-hover-preview"]'
        )
      ).not.toBeNull()
    )
    expect(
      screen.getAllByText("Compare the manuscript witnesses.").length
    ).toBeGreaterThan(0)
    document.unmount()

    const handle = render(
      <Attachment
        kind="username-handle"
        variant="preview"
        title="@reviewer"
        meta="Corpus editor"
        initials="CE"
      />
    )
    expect(screen.queryByText("Corpus editor")).toBeNull()
    fireEvent.focus(
      handle.container.querySelector('[data-slot="preview-card-trigger"]')!
    )
    expect(await screen.findByText("Corpus editor")).toBeDefined()
  })

  test("local images get a real preview URL, release replaced URLs, and keep file data off the DOM", async () => {
    const createURL = spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:first-image")
      .mockReturnValueOnce("blob:second-image")
    const revokeURL = spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    const first = new File(["image"], "scan.JPG", { type: "" })
    const second = new File(["image two"], "scan.png", { type: "image/png" })
    const view = render(
      <Attachment kind="document" title="scan" file={first} variant="preview" />
    )
    try {
      await waitFor(() =>
        expect(
          screen.getByRole("img", { name: "scan" }).getAttribute("src")
        ).toBe("blob:first-image")
      )
      expect(view.container.querySelector('[data-kind="image"]')).not.toBeNull()
      expect(view.container.querySelector("[file]")).toBeNull()
      view.rerender(
        <Attachment kind="image" title="scan" file={second} variant="preview" />
      )
      await waitFor(() =>
        expect(
          screen.getByRole("img", { name: "scan" }).getAttribute("src")
        ).toBe("blob:second-image")
      )
      expect(revokeURL).toHaveBeenCalledWith("blob:first-image")
      view.unmount()
      expect(revokeURL).toHaveBeenCalledWith("blob:second-image")
    } finally {
      view.unmount()
      createURL.mockRestore()
      revokeURL.mockRestore()
    }
  })

  test("local text files supply a readable excerpt", async () => {
    const file = new File(
      ["Verse notes: compare the parallel passage."],
      "notes.txt",
      { type: "text/plain" }
    )
    const createURL = spyOn(URL, "createObjectURL").mockReturnValue(
      "blob:notes"
    )
    const revokeURL = spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    const view = render(
      <Attachment kind="document" title="notes.txt" file={file} />
    )
    try {
      expect(
        await screen.findByText("Verse notes: compare the parallel passage.")
      ).toBeDefined()
    } finally {
      view.unmount()
      createURL.mockRestore()
      revokeURL.mockRestore()
    }
  })
})
