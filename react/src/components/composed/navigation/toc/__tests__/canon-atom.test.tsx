import { describe, expect, test } from "bun:test"
import { StrictMode } from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { createStore } from "jotai"
import {
  ExegiaProvider,
  canonStateAtom,
  canonSelectedLinkAtom,
  selectCanonItemAtom,
  setCanonSectionAtom,
  resetCanonAtom,
} from "@/lib/state"
import { Canonical } from "../canon"
import type { TCanonItem } from "../type"

const book: TCanonItem = {
  id: "gen",
  label: "Genesis",
  link: "#gen-book",
  level: 2,
  type: "book",
  abbreviation: "GEN",
  nodes: [
    {
      id: "gen-1",
      label: "Chapter 1",
      link: "#gen-1-chapter",
      level: 3,
      type: "chapter",
      number: 1,
    },
  ],
}
const other: TCanonItem = {
  ...book,
  id: "exod",
  label: "Exodus",
  link: "#exod-book",
  abbreviation: "EXO",
}
const items: TCanonItem[] = [
  {
    id: "first",
    label: "First",
    link: "#first-section",
    level: 1,
    type: "section",
    nodes: [book],
  },
  {
    id: "second",
    label: "Second",
    link: "#second-section",
    level: 1,
    type: "section",
    nodes: [other],
  },
]

describe("Canon atoms", () => {
  test("isolates ids and stores, toggles expansion immutably, and resets", () => {
    const store = createStore()
    const another = createStore()
    const initial = store.get(canonStateAtom("a"))
    store.set(selectCanonItemAtom("a"), book)
    store.set(setCanonSectionAtom("a"), "second")
    expect(store.get(canonStateAtom("a")).expandedIds.has("gen")).toBe(true)
    expect(initial.expandedIds.size).toBe(0)
    expect(store.get(canonStateAtom("b"))).toEqual(initial)
    expect(another.get(canonStateAtom("a"))).toEqual(initial)
    store.set(selectCanonItemAtom("a"), book)
    expect(store.get(canonStateAtom("a")).expandedIds.has("gen")).toBe(true)
    store.set(selectCanonItemAtom("a"), other)
    store.set(selectCanonItemAtom("a"), book)
    expect(store.get(canonStateAtom("a")).expandedIds.has("gen")).toBe(false)
    store.set(resetCanonAtom("a"))
    expect(store.get(canonStateAtom("a"))).toEqual(initial)
  })

  test("shared provider supports remote changes and publishes UI selection", async () => {
    const store = createStore()
    render(
      <ExegiaProvider store={store}>
        <Canonical canonId="remote" items={items} onLinkClick={() => {}} />
      </ExegiaProvider>
    )
    await act(async () => {
      store.set(setCanonSectionAtom("remote"), "second")
      store.set(selectCanonItemAtom("remote"), other)
    })
    expect(screen.getByRole("heading", { name: "Chapters" })).toBeTruthy()
    expect(store.get(canonStateAtom("remote")).browseLink).toBe(other.link)
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: "First" }))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "GEN" }))
    })
    expect(store.get(canonStateAtom("remote")).selectedLink).toBe(book.link)
    expect(store.get(canonStateAtom("remote")).activeSectionId).toBe("first")
  })

  test("controlled selection remains authoritative for remote readers and actions", async () => {
    const store = createStore()
    const view = render(
      <ExegiaProvider store={store}>
        <Canonical
          canonId="controlled"
          items={items}
          activeLink={book}
          onLinkClick={() => {}}
        />
      </ExegiaProvider>
    )
    expect(store.get(canonSelectedLinkAtom("controlled"))).toBe(book.link)
    await act(async () => {
      store.set(selectCanonItemAtom("controlled"), other)
    })
    expect(store.get(canonSelectedLinkAtom("controlled"))).toBe(book.link)
    view.rerender(
      <ExegiaProvider store={store}>
        <Canonical
          canonId="controlled"
          items={items}
          activeLink={other}
          onLinkClick={() => {}}
        />
      </ExegiaProvider>
    )
    expect(store.get(canonSelectedLinkAtom("controlled"))).toBe(other.link)
  })

  test("anonymous instances survive StrictMode replay and stay independent", async () => {
    render(
      <StrictMode>
        <ExegiaProvider store={createStore()}>
          <Canonical items={items} onLinkClick={() => {}} />
          <Canonical items={items} onLinkClick={() => {}} />
        </ExegiaProvider>
      </StrictMode>
    )
    await act(async () => {})
    const tiles = screen.getAllByRole("radio", { name: "GEN" })
    await act(async () => {
      fireEvent.click(tiles[0]!)
    })
    expect(screen.getAllByRole("heading", { name: "Chapters" })).toHaveLength(1)
    expect(tiles[1]!.getAttribute("aria-checked")).toBe("false")
  })
})
