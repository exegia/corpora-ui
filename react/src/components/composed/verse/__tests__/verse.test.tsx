import { describe, expect, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Verse, VerseNote, VerseSpan } from "../verse"

function DemoVerse() {
  return (
    <Verse
      chapter="1:1"
      chapterPopover={<p>Chapter body</p>}
      href="#gen-1"
      size="small"
    >
      In the beginning{" "}
      <VerseSpan popover={<p>Span body</p>}>God created</VerseSpan> the earth
      <VerseNote popover={<p>Note body</p>}>a</VerseNote>.
    </Verse>
  )
}

describe("verse", () => {
  test("renders the chapter as a link and the note as a subscript", () => {
    render(<DemoVerse />)

    const chapter = screen.getByText("1:1")
    expect(chapter.tagName).toBe("A")
    expect(chapter.getAttribute("href")).toBe("#gen-1")
    expect(screen.getByText("a").tagName).toBe("SUB")
    expect(screen.getByText(/the earth/).closest("[data-verse]")).toBeTruthy()
  })

  test("chapter, span and note each open their own popover on click", async () => {
    const user = userEvent.setup()
    render(<DemoVerse />)

    await user.click(screen.getByText("1:1"))
    expect(await screen.findByText("Chapter body")).toBeTruthy()

    await user.click(screen.getByText("God created"))
    expect(await screen.findByText("Span body")).toBeTruthy()

    await user.click(screen.getByText("a"))
    expect(await screen.findByText("Note body")).toBeTruthy()
  })

  test("a chapter without a popover renders a plain link", () => {
    render(
      <Verse chapter="2:4" href="#gen-2">
        A generations heading.
      </Verse>
    )

    const chapter = screen.getByText("2:4")
    expect(chapter.tagName).toBe("A")
    expect(chapter.getAttribute("role")).toBeNull()
  })

  test("a span without popover content is a plain span", async () => {
    const user = userEvent.setup()
    render(
      <Verse chapter="1:2" href="#gen-1-2">
        and the <VerseSpan>earth</VerseSpan> was
      </Verse>
    )
    const span = screen.getByText("earth")
    expect(span.getAttribute("role")).toBeNull()
    expect(span.getAttribute("tabindex")).toBeNull()
    await user.click(span)
    expect(document.querySelector("[data-selection-popover]")).toBeNull()
  })

  test("spans open from the keyboard and expose their state", async () => {
    const user = userEvent.setup()
    render(<DemoVerse />)
    const span = screen.getByText("God created")
    expect(span.getAttribute("role")).toBe("button")
    expect(span.getAttribute("aria-haspopup")).toBe("dialog")
    expect(span.getAttribute("aria-expanded")).toBe("false")

    span.focus()
    await user.keyboard("{Enter}")
    expect(await screen.findByText("Span body")).toBeTruthy()
    expect(span.getAttribute("aria-expanded")).toBe("true")
  })

  test("content that changes while the popover is open shows immediately", async () => {
    const user = userEvent.setup()
    const Editable = ({ n }: { n: number }) => (
      <Verse chapter="1:1" href="#gen-1">
        <VerseSpan popover={<p>content-{n}</p>}>word</VerseSpan>
      </Verse>
    )
    const { rerender } = render(<Editable n={0} />)
    await user.click(screen.getByText("word"))
    await screen.findByText("content-0")

    rerender(<Editable n={1} />)
    expect(await screen.findByText("content-1")).toBeTruthy()
  })

  test("unmounting the open part closes its popover", async () => {
    const user = userEvent.setup()
    const Toggling = ({ show }: { show: boolean }) => (
      <Verse chapter="1:1" href="#gen-1">
        {show ? <VerseSpan popover={<p>Gone body</p>}>gone</VerseSpan> : null} rest
      </Verse>
    )
    const { rerender } = render(<Toggling show />)
    await user.click(screen.getByText("gone"))
    await screen.findByText("Gone body")

    rerender(<Toggling show={false} />)
    await waitFor(() => {
      if (screen.queryByText("Gone body")) throw new Error("popover still open")
    })
  })
})
