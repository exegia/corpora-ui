import { expect, mock, test } from "bun:test"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Canonical } from "../canon"
import { Root } from "../default"
import type { TCanonItem, TTocItem } from "../type"

const book: TCanonItem = {
  id: "exod",
  label: "Exodus",
  abbreviation: "EXO",
  link: "#exod-book",
  level: 2,
  type: "book",
}
const canon: TCanonItem[] = [
  {
    id: "ot",
    label: "Old Testament",
    link: "#ot-section",
    level: 1,
    type: "section",
    nodes: [book],
  },
]

test("selecting the active verse again requests navigation again", async () => {
  const verse: TCanonItem = {
    id: "GEN-1-1",
    label: "Genesis 1:1",
    abbreviation: "GEN",
    number: 1,
    link: "#demo-GEN-1-1-verse",
    type: "verse",
    level: 4,
  }
  const navigate = mock()
  render(<Canonical items={[verse]} onLinkClick={navigate} />)
  const button = screen.getByRole("radio", { name: "1" })
  await act(async () => {
    fireEvent.click(button)
  })
  expect(navigate).toHaveBeenCalledTimes(1)
  await act(async () => {
    fireEvent.click(button)
  })
  expect(navigate).toHaveBeenCalledTimes(2)
  expect(navigate).toHaveBeenLastCalledWith(verse)
})

test("canonical tile menu receives the book without navigating on right click", async () => {
  const onSelect = mock()
  const navigate = mock()
  render(
    <Canonical
      items={canon}
      onLinkClick={navigate}
      contextMenuItems={(item) => [
        { id: "bookmark", label: `Bookmark ${String(item.label)}`, onSelect },
        { id: "disabled", label: "Unavailable", disabled: true, onSelect },
      ]}
    />
  )
  await act(async () => {
    fireEvent.contextMenu(screen.getByRole("radio", { name: "EXO" }), {
      button: 2,
      clientX: 30,
      clientY: 30,
    })
  })
  const action = await screen.findByRole("menuitem", {
    name: "Bookmark Exodus",
  })
  expect(navigate).not.toHaveBeenCalled()
  expect(
    screen
      .getByRole("menuitem", { name: "Unavailable" })
      .getAttribute("aria-disabled")
  ).toBe("true")
  await act(async () => {
    fireEvent.click(action)
  })
  expect(onSelect).toHaveBeenCalledWith(book)
  expect(navigate).not.toHaveBeenCalled()
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
  await act(async () => {
    fireEvent.click(screen.getByRole("radio", { name: "EXO" }))
  })
  expect(navigate).toHaveBeenCalledWith(book)
})

const leaf: TTocItem = {
  id: "needle",
  label: "Read in context",
  link: "#needle-paragraph",
  level: 3,
  type: "paragraph",
}
const items: TTocItem[] = [
  {
    id: "handbook",
    label: "Handbook",
    link: "#handbook-book",
    level: 1,
    type: "book",
    nodes: [
      {
        id: "chapter",
        label: "Reading",
        link: "#chapter-chapter",
        level: 2,
        type: "chapter",
        nodes: [leaf],
      },
      {
        id: "other",
        label: "Unrelated",
        link: "#other-chapter",
        level: 2,
        type: "chapter",
      },
    ],
  },
]

test("search reveals nested matches, preserves navigation data, and restores collapsed branches", async () => {
  const navigate = mock()
  render(<Root items={items} onLinkClick={navigate} />)
  expect(screen.queryByText("Read in context")).toBeNull()
  const input = screen.getByRole("searchbox", {
    name: "Search table of contents",
  })
  await act(async () => {
    fireEvent.change(input, { target: { value: "  CONTEXT " } })
  })
  const result = await screen.findByText("Read in context")
  expect(screen.getByText("Handbook")).toBeTruthy()
  expect(screen.queryByText("Unrelated")).toBeNull()
  await act(async () => {
    fireEvent.click(result)
  })
  expect(navigate).toHaveBeenCalledWith(leaf)
  await act(async () => {
    fireEvent.change(input, { target: { value: "missing" } })
  })
  expect(screen.getByRole("status").textContent).toBe("No results found.")
  await act(async () => {
    fireEvent.change(input, { target: { value: "" } })
  })
  expect(screen.queryByRole("status")).toBeNull()
  expect(screen.queryByText("Read in context")).toBeNull()
  expect(screen.getByText("Handbook")).toBeTruthy()
})
