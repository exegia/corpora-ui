import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { AISidebar } from "../ai-sidebar"
import type { SidebarResource } from "../type.ts"

const RESOURCES: SidebarResource[] = [
  {
    id: "corpora",
    label: "Corpora",
    kind: "project",
    children: [
      { id: "manuscripts", label: "Manuscripts", kind: "folder" },
      { id: "readme", label: "Field notes", kind: "file" },
    ],
  },
  { id: "reading-list", label: "Reading list", kind: "bookmark" },
  { id: "empty-folder", label: "Empty folder", kind: "folder" },
]

const chevronOf = (row: HTMLElement) =>
  row.querySelector("svg.lucide-chevron-right")

describe("AISidebar", () => {
  test("renders the tree and marks the active row", () => {
    render(
      <AISidebar defaultItems={RESOURCES} defaultActiveId="reading-list" />
    )

    expect(screen.getByRole("tree", { name: "Resources" })).toBeDefined()
    const active = screen.getByRole("treeitem", { name: /Reading list/ })
    expect(active.getAttribute("aria-selected")).toBe("true")
    expect(active.className).toContain("bg-primary/10")
  })

  test("shows a trailing chevron only on root rows with children", () => {
    render(
      <AISidebar defaultItems={RESOURCES} defaultExpandedIds={["corpora"]} />
    )

    const root = screen.getByRole("treeitem", { name: /Corpora/ })
    const chevron = chevronOf(root)
    expect(chevron).not.toBeNull()
    // Expanded root rows rotate the chevron to point down.
    expect(chevron?.getAttribute("class")).toContain("rotate-90")

    // Childless root folder and nested folder both render without one.
    expect(
      chevronOf(screen.getByRole("treeitem", { name: /Empty folder/ }))
    ).toBeNull()
    expect(
      chevronOf(screen.getByRole("treeitem", { name: /Manuscripts/ }))
    ).toBeNull()
  })

  test("chevron sits flat while the root row is collapsed", () => {
    render(<AISidebar defaultItems={RESOURCES} />)

    const chevron = chevronOf(
      screen.getByRole("treeitem", { name: /Corpora/ })
    )
    expect(chevron).not.toBeNull()
    expect(chevron?.getAttribute("class")).not.toContain("rotate-90")
  })

  test("renderActionsTrigger replaces the default actions button", async () => {
    const user = userEvent.setup()
    const selected: string[] = []
    render(
      <AISidebar
        defaultItems={RESOURCES}
        onActiveChange={(id) => selected.push(id)}
        renderActionsTrigger={(item) => (
          <button type="button" aria-label={`Custom actions ${item.label}`}>
            *
          </button>
        )}
      />
    )

    expect(
      screen.queryByRole("button", { name: "Actions for Reading list" })
    ).toBeNull()

    // Opening the menu from the custom trigger must not select the row.
    await user.click(
      screen.getByRole("button", { name: "Custom actions Reading list" })
    )
    expect(await screen.findByText("Rename")).toBeDefined()
    expect(selected).toEqual([])
  })
})
