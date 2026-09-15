import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
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
})
