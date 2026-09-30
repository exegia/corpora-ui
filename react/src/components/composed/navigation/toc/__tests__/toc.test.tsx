import { describe, expect, mock, test } from "bun:test"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { TOC } from "../index"
import { Canonical } from "../canon"
import { Root } from "../default"
import type { TCanonItem, TTocItem } from "../types"
import { getLabelText, mapItemsToTreeNodes } from "../utils"

const verse = {
  id: "gen-1-1",
  label: "Verse 1",
  link: "#gen-1-1-verse",
  level: 4,
  type: "verse",
  number: 1,
} satisfies TCanonItem
const chapter = {
  id: "gen-1",
  label: "Chapter 1",
  link: "#gen-1-chapter",
  level: 3,
  type: "chapter",
  number: 1,
  nodes: [verse],
} satisfies TCanonItem
const book = {
  id: "gen",
  label: "Genesis",
  link: "#gen-book",
  level: 2,
  type: "book",
  abbreviation: "Gen",
  nodes: [chapter],
} satisfies TCanonItem
const canon = [
  {
    id: "ot",
    label: "Old Testament",
    link: "#ot-section",
    level: 1,
    type: "section",
    nodes: [book],
  },
] satisfies TCanonItem[]

describe("TOC views", () => {
  test("exports separate regular and Canon components", () => {
    expect(TOC.Root).toBe(Root)
    expect(TOC.Canonical).toBe(Canonical)
    expect(Root).not.toBe(Canonical)
  })

  test("regular TOC expands tree rows and selects leaves", async () => {
    const onLinkClick = mock()
    const { container } = render(
      <Root items={[chapter]} onLinkClick={onLinkClick} />
    )
    expect(container.querySelector('[data-slot="toc-canon-grid"]')).toBeNull()
    await act(async () => {
      fireEvent.click(screen.getByText("Chapter 1"))
    })
    await waitFor(() => expect(screen.getByText("Verse 1")).toBeTruthy())
    await act(async () => {
      fireEvent.click(screen.getByText("Verse 1"))
    })
    expect(onLinkClick.mock.calls[0]?.[0]).toBe(chapter)
    expect(onLinkClick.mock.calls[1]?.[0]).toBe(verse)
  })

  test("Canon reveals square book, chapter, and verse grids", async () => {
    const onLinkClick = mock()
    const { container } = render(
      <Canonical items={canon} onLinkClick={onLinkClick} />
    )
    await act(async () => {})
    expect(screen.getByText("Old Testament")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Genesis" }).textContent).toBe(
      "Gen"
    )
    expect(screen.queryByRole("button", { name: "Chapter 1" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Genesis" }))
    expect(
      screen
        .getByRole("button", { name: "Genesis" })
        .getAttribute("aria-expanded")
    ).toBe("true")
    fireEvent.click(screen.getByRole("button", { name: "Chapter 1" }))
    const verseLink = screen.getByRole("button", { name: "Verse 1" })
    expect(verseLink.textContent).toBe("1")
    fireEvent.click(verseLink)
    expect(verseLink.getAttribute("aria-current")).toBe("page")
    expect(onLinkClick.mock.calls.map(([item]) => item)).toEqual([
      book,
      chapter,
      verse,
    ])
    expect(
      container.querySelectorAll('[data-slot="toc-canon-grid"]').length
    ).toBe(3)
    for (const link of container.querySelectorAll('[data-slot="toggle"]')) {
      expect(link.getAttribute("style")).toContain("aspect-ratio: 1")
    }
    fireEvent.click(screen.getByRole("button", { name: "Genesis" }))
    expect(screen.queryByRole("button", { name: "Chapter 1" })).toBeNull()
  })

  test("section tabs switch the visible collection above the square grid", async () => {
    const newTestament = {
      id: "nt",
      label: "New Testament",
      link: "#nt-section",
      level: 1,
      type: "section",
      nodes: [
        {
          ...book,
          id: "matt",
          label: "Matthew",
          link: "#matt-book",
          abbreviation: "Matt",
        },
      ],
    } satisfies TCanonItem
    const { container } = render(<Canonical items={[...canon, newTestament]} />)
    expect(
      screen
        .getByRole("tab", { name: "Old Testament" })
        .getAttribute("aria-selected")
    ).toBe("true")
    expect(screen.queryByRole("button", { name: "Matthew" })).toBeNull()
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: "New Testament" }))
    })
    expect(screen.getByRole("button", { name: "Matthew" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Genesis" })).toBeNull()
    expect(
      container
        .querySelector('[data-slot="toc-canon-grid"]')
        ?.getAttribute("style")
    ).toContain("gap: 4px")
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: "Old Testament" }))
    })
    expect(screen.getByRole("button", { name: "Genesis" })).toBeTruthy()
  })

  test("Canon navigates by hash without a callback and respects controlled selection", () => {
    render(<Canonical items={[book]} activeLink={book} />)
    const bookLink = screen.getByRole("button", { name: "Genesis" })
    expect(bookLink.getAttribute("aria-current")).toBe("page")
    fireEvent.click(bookLink)
    expect(window.location.hash).toBe(book.link)
    fireEvent.click(screen.getByRole("button", { name: "Chapter 1" }))
    expect(window.location.hash).toBe(chapter.link)
    expect(bookLink.getAttribute("aria-current")).toBe("page")
  })

  test("both views accept empty collections", () => {
    const { container } = render(
      <>
        <Root items={[]} />
        <Canonical items={[]} />
      </>
    )
    expect(container.querySelectorAll('[data-slot="toggle"]').length).toBe(0)
  })

  test("tree labels preserve rich display text and produce searchable text", () => {
    const item = {
      id: "intro",
      label: (
        <span>
          Intro <strong>chapter</strong>
        </span>
      ),
      link: "#intro-chapter",
      level: 2,
      type: "chapter",
    } satisfies TTocItem
    expect(getLabelText(item.label, item.id)).toBe("Intro chapter")
    expect(mapItemsToTreeNodes([item])[0]?.name).toBe("Intro chapter")
  })
})

// Compile-time checks: reject metadata field names and unrelated child kinds.
const invalidAbbreviation: TCanonItem = {
  id: "invalid",
  label: "Invalid",
  link: "#invalid-book",
  level: 2,
  type: "book",
  // @ts-expect-error OSIS abbreviations are registry keys, not metadata fields.
  abbreviation: "name",
}
void invalidAbbreviation
const invalidChapter: TCanonItem<number, "Gen", "chapter"> = {
  id: "invalid",
  label: "Invalid",
  link: "#invalid-chapter",
  level: 3,
  type: "chapter",
  number: 1,
  // @ts-expect-error A chapter cannot contain a book.
  nodes: [book],
}
void invalidChapter
