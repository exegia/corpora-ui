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

  test("Canon preserves the section tabs and flat toggle groups", async () => {
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
    const onLinkClick = mock()
    render(
      <Canonical items={[...canon, newTestament]} onLinkClick={onLinkClick} />
    )
    await act(async () => {})
    expect(
      screen
        .getByRole("tab", { name: "Old Testament" })
        .getAttribute("aria-selected")
    ).toBe("true")
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "Gen" }))
    })
    expect(onLinkClick.mock.calls[0]?.[0]).toBe(book)
    expect(screen.queryByText("Chapter 1")).toBeNull()
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: "New Testament" }))
    })
    expect(screen.getByRole("radio", { name: "Matt" })).toBeTruthy()
    expect(screen.queryByRole("radio", { name: "Gen" })).toBeNull()
  })

  test("Canon keeps hash navigation without restoring nested views", async () => {
    render(<Canonical items={canon} />)
    await act(async () => {})
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "Gen" }))
    })
    expect(window.location.hash).toBe(book.link)
    expect(screen.queryByText("Chapter 1")).toBeNull()
  })

  test("Canon has one selected tile and clears previous tile state", async () => {
    const exodus = {
      ...book,
      id: "exod",
      label: "Exodus",
      abbreviation: "Exod",
      link: "#exod-book",
    } satisfies TCanonItem
    const onLinkClick = mock()
    render(
      <Canonical
        items={[{ ...canon[0]!, nodes: [book, exodus] }]}
        onLinkClick={onLinkClick}
      />
    )
    await act(async () => {})
    const genesisTile = screen.getByRole("radio", { name: "Gen" })
    const exodusTile = screen.getByRole("radio", { name: "Exod" })
    for (const tile of [genesisTile, exodusTile, genesisTile, genesisTile]) {
      await act(async () => {
        fireEvent.click(tile)
      })
      expect(
        screen
          .getAllByRole("radio")
          .filter((radio) => radio.getAttribute("aria-checked") === "true")
      ).toEqual([tile])
    }
    expect(exodusTile.getAttribute("data-state")).not.toBe("on")
    expect(exodusTile.querySelector("[aria-hidden=true]")).toBeNull()
    expect(genesisTile.querySelector("[aria-hidden=true]")).toBeTruthy()
    expect(onLinkClick).toHaveBeenCalledTimes(3)
  })

  test("Canon follows externally controlled selection", async () => {
    const exodus = {
      ...book,
      id: "exod",
      label: "Exodus",
      abbreviation: "Exod",
      link: "#exod-book",
    } satisfies TCanonItem
    const items = [{ ...canon[0]!, nodes: [book, exodus] }]
    const view = render(
      <Canonical items={items} activeLink={book} onLinkClick={() => {}} />
    )
    await act(async () => {})
    expect(
      screen.getByRole("radio", { name: "Gen" }).getAttribute("aria-checked")
    ).toBe("true")
    view.rerender(
      <Canonical items={items} activeLink={exodus} onLinkClick={() => {}} />
    )
    await act(async () => {})
    expect(
      screen.getByRole("radio", { name: "Gen" }).getAttribute("aria-checked")
    ).toBe("false")
    expect(
      screen.getByRole("radio", { name: "Exod" }).getAttribute("aria-checked")
    ).toBe("true")
  })

  test("both views accept empty collections", () => {
    const { container } = render(
      <>
        <Root items={[]} />
        <Canonical items={[]} />
      </>
    )
    expect(
      container.querySelectorAll('[data-slot="toggle-group-item"]').length
    ).toBe(0)
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
