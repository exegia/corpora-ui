import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SidebarBlock, type SidebarNavSection } from "../sidebar-block"

const SECTIONS: SidebarNavSection[] = [
  {
    id: "work",
    label: "Research",
    items: [
      { id: "search", label: "Search" },
      {
        id: "library",
        label: "Library",
        items: [
          { id: "manuscripts", label: "Manuscripts" },
          { id: "codices", label: "Codices" },
        ],
      },
    ],
  },
  { id: "workspace", items: [{ id: "settings", label: "Settings" }] },
]

describe("SidebarBlock", () => {
  test("renders the sections and their entries", () => {
    render(<SidebarBlock ariaLabel="Main" sections={SECTIONS} />)

    expect(screen.getByRole("navigation", { name: "Main" })).toBeDefined()
    expect(screen.getByText("Research")).toBeDefined()
    expect(screen.getByRole("button", { name: "Search" })).toBeDefined()
    expect(screen.getByRole("button", { name: "Settings" })).toBeDefined()
  })

  test("marks the active entry", () => {
    render(<SidebarBlock activeId="search" sections={SECTIONS} />)

    expect(
      screen
        .getByRole("button", { name: "Search" })
        .getAttribute("aria-current")
    ).toBe("page")
    expect(
      screen
        .getByRole("button", { name: "Settings" })
        .getAttribute("aria-current")
    ).toBeNull()
  })

  test("reports selections through onNavigate, after the entry's onSelect", async () => {
    const user = userEvent.setup()
    const calls: string[] = []
    render(
      <SidebarBlock
        onNavigate={(item) => calls.push(`navigate:${item.id}`)}
        sections={[
          {
            id: "work",
            items: [
              {
                id: "search",
                label: "Search",
                onSelect: () => calls.push("select:search"),
              },
            ],
          },
        ]}
      />
    )

    await user.click(screen.getByRole("button", { name: "Search" }))

    expect(calls).toEqual(["select:search", "navigate:search"])
  })

  test("an entry with children expands instead of navigating", async () => {
    const user = userEvent.setup()
    const onNavigate = mock(() => {})
    render(<SidebarBlock onNavigate={onNavigate} sections={SECTIONS} />)

    const parent = screen.getByRole("button", { name: "Library" })
    expect(parent.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("button", { name: "Manuscripts" })).toBeNull()

    await user.click(parent)

    expect(
      await screen.findByRole("button", { name: "Manuscripts" })
    ).toBeDefined()
    expect(parent.getAttribute("aria-expanded")).toBe("true")
    expect(onNavigate).not.toHaveBeenCalled()
  })

  test("starts expanded when one of its children is active", async () => {
    render(<SidebarBlock activeId="codices" sections={SECTIONS} />)

    const child = await screen.findByRole("button", { name: "Codices" })
    expect(child.getAttribute("aria-current")).toBe("page")
    expect(
      screen
        .getByRole("button", { name: "Library" })
        .getAttribute("aria-expanded")
    ).toBe("true")
  })

  test("renders href entries as links", () => {
    render(
      <SidebarBlock
        sections={[
          {
            id: "work",
            items: [
              { id: "docs", label: "Docs", href: "/docs", target: "_blank" },
            ],
          },
        ]}
      />
    )

    const link = screen.getByRole("link", { name: "Docs" })
    expect(link.getAttribute("href")).toBe("/docs")
    expect(link.getAttribute("rel")).toBe("noreferrer noopener")
  })
})
