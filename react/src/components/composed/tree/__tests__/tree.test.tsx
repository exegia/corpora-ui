import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FileTextIcon, FolderIcon, SearchIcon } from "lucide-react"

import { Tree } from "../index"
import type { TreeNode } from "../type"
import { moveNode } from "../utils"

/** 3-level data — `navigation` promotes the top level to section names. */
const SECTIONED: TreeNode[] = [
  {
    id: "research",
    label: "Research",
    children: [
      { id: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
      {
        id: "library",
        label: "Library",
        children: [
          { id: "manuscripts", label: "Manuscripts", href: "/m" },
          { id: "codices", label: "Codices", href: "/c" },
        ],
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    children: [{ id: "notes", label: "Notes", href: "/notes" }],
  },
]

/** 2-level data — the top level stays plain link rows. */
const FLAT_NAV: TreeNode[] = [
  { id: "search", label: "Search", href: "/search" },
  {
    id: "library",
    label: "Library",
    children: [{ id: "manuscripts", label: "Manuscripts", href: "/m" }],
  },
]

const TOC: TreeNode[] = [
  {
    id: "guide",
    label: "Guide",
    href: "/guide",
    children: [
      {
        id: "setup",
        label: "Setup",
        children: [{ id: "install", label: "Install" }],
      },
    ],
  },
  { id: "api", label: "API", href: "/api" },
]

const RAIL: TreeNode[] = [
  { id: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { id: "notes", label: "Notes", icon: <FileTextIcon />, href: "/notes" },
]

const FILES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: <FolderIcon />,
    defaultOpen: true,
    children: [
      { id: "index-ts", label: "index.ts" },
      { id: "utils-ts", label: "utils.ts" },
    ],
  },
  { id: "readme", label: "README.md" },
]

/** Branch exits run through AnimatePresence — let them settle on real
 * timers, then query once (happy-dom serves stale waitFor queries while
 * an exit is in flight). */
const settleExit = () => new Promise((resolve) => setTimeout(resolve, 400))

describe("Tree · navigation", () => {
  test("3-level data renders top level as collapsible sections, not links", async () => {
    const user = userEvent.setup()
    render(<Tree items={SECTIONED} variant="navigation" />)

    const section = screen.getByRole("button", { name: "Research" })
    expect(section.getAttribute("aria-expanded")).toBe("true")
    // Sections are buttons — no anchor wraps them.
    expect(section.closest("a")).toBeNull()
    expect(screen.getByRole("link", { name: "Search" })).toBeDefined()

    // Collapsing the section folds its items away.
    await user.click(section)
    await settleExit()
    expect(screen.queryByRole("link", { name: "Search" })).toBeNull()
  })

  test("2-level data keeps top level as links and parents as toggles", async () => {
    const user = userEvent.setup()
    render(<Tree items={FLAT_NAV} variant="navigation" />)

    expect(screen.getByRole("link", { name: "Search" })).toBeDefined()
    const parent = screen.getByRole("button", { name: "Library" })
    expect(parent.getAttribute("aria-expanded")).toBe("false")

    await user.click(parent)
    expect(await screen.findByRole("link", { name: "Manuscripts" })).toBeDefined()
  })

  test("read-only variants render no drag or rename affordances", () => {
    render(<Tree items={SECTIONED} variant="navigation" />)
    const rows = document.querySelectorAll('[data-slot="tree-row"]')
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) expect(row.getAttribute("draggable")).toBeNull()
  })

  test("activeId marks the row current and expands collapsed ancestors", async () => {
    const { rerender } = render(
      <Tree items={SECTIONED} variant="navigation" />
    )
    // Library starts collapsed — its children are absent.
    expect(screen.queryByRole("link", { name: "Codices" })).toBeNull()

    rerender(<Tree activeId="codices" items={SECTIONED} variant="navigation" />)
    const active = await screen.findByRole("link", { name: "Codices" })
    expect(active.getAttribute("aria-current")).toBe("page")
  })

  test("onNavigate fires for link rows after the node's own onSelect", async () => {
    const user = userEvent.setup()
    const order: string[] = []
    const items: TreeNode[] = [
      {
        id: "a",
        label: "Alpha",
        href: "/a",
        onSelect: () => order.push("onSelect"),
      },
    ]
    render(
      <Tree
        items={items}
        onNavigate={() => order.push("onNavigate")}
        variant="navigation"
      />
    )
    await user.click(screen.getByRole("link", { name: "Alpha" }))
    expect(order).toEqual(["onSelect", "onNavigate"])
  })
})

describe("Tree · toc", () => {
  test("leaves anchor to #{id}; explicit hrefs win; parents keep their route", async () => {
    const user = userEvent.setup()
    render(<Tree items={TOC} variant="toc" />)

    const guide = screen.getByRole("link", { name: "Guide" })
    expect(guide.getAttribute("href")).toBe("/guide")

    // Guide navigates on the row; its expansion is the overlay toggle.
    await user.click(screen.getByRole("button", { name: "Expand Guide" }))
    // Below the route level every node is an in-page anchor, parents
    // included — only depth 0 carries routes.
    const setup = await screen.findByRole("link", { name: "Setup" })
    expect(setup.getAttribute("href")).toBe("#setup")

    await user.click(screen.getByRole("button", { name: "Expand Setup" }))
    const install = await screen.findByRole("link", { name: "Install" })
    expect(install.getAttribute("href")).toBe("#install")
  })
})

describe("Tree · sidebar", () => {
  test("the rail's width class tracks collapsed in both directions", async () => {
    // Locks the resting widths to the class, so the rail is right even when
    // the animation never applies. NB this does NOT reproduce the bug it was
    // written alongside — that was an inline width pinned at 44px by a
    // px-against-"100%" motion target, and motion sets no inline styles
    // under happy-dom. Only a real browser catches that one.
    const { rerender } = render(<Tree items={RAIL} variant="sidebar" />)
    const rail = () => document.querySelector('[data-slot="tree"]')

    expect(rail()?.className).toContain("w-full")
    expect(rail()?.getAttribute("data-collapsed")).toBeNull()

    rerender(<Tree collapsed items={RAIL} variant="sidebar" />)
    await settleExit()
    expect(rail()?.className).toContain("w-11")
    expect(rail()?.getAttribute("data-collapsed")).toBe("")

    // Back open — the direction that was broken.
    rerender(<Tree items={RAIL} variant="sidebar" />)
    await settleExit()
    expect(rail()?.className).toContain("w-full")
    expect(rail()?.className).not.toContain("w-11")
    expect(rail()?.getAttribute("data-collapsed")).toBeNull()
  })

  test("collapsed shows icon-only rows that keep an accessible name", async () => {
    const { rerender } = render(<Tree items={RAIL} variant="sidebar" />)
    expect(screen.getByRole("link", { name: "Search" }).textContent).toContain(
      "Search"
    )

    rerender(<Tree collapsed items={RAIL} variant="sidebar" />)
    await settleExit()
    const row = screen.getByRole("link", { name: "Search" })
    // The label folds to nothing rather than unmounting — keeping it in the
    // DOM is what lets the fold animate — so assert the fold, not absence.
    const label = row.querySelector('[data-slot="tree-row-label"]')
    expect(label?.textContent).toBe("Search")
    expect(label?.getAttribute("style")).toContain("display: none")
    // With the label hidden, aria-label is what names the row.
    expect(row.getAttribute("aria-label")).toBe("Search")
  })

  test("rail rows are tooltip triggers and keep identity across collapse", async () => {
    // happy-dom can't drive Base UI's hover/focus-visible open logic, so
    // assert the wiring: Base UI stamps its trigger attribute on the row.
    const { rerender } = render(<Tree collapsed items={RAIL} variant="sidebar" />)
    const collapsedRow = screen.getByRole("link", { name: "Search" })
    expect(collapsedRow.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true)

    // The tooltip wrapper stays mounted when the rail expands (it is only
    // disabled) — a remounted row would cut the label fold animation short.
    // Let the label unfold before querying: mid-animation it is still
    // display:none, and the row has no aria-label once expanded, so it has
    // no accessible name to match on until the fold-out finishes.
    // NB this asserts identity, not the fold-out itself — motion settles
    // instantly under happy-dom, while in a real browser the rail currently
    // does not reanimate back open. That defect is tracked separately; do
    // not read this test as covering it.
    rerender(<Tree items={RAIL} variant="sidebar" />)
    await settleExit()
    expect(screen.getByRole("link", { name: "Search" })).toBe(collapsedRow)
  })

  test("nested children are ignored — the rail is single-level", () => {
    const items: TreeNode[] = [
      {
        id: "top",
        label: "Top",
        icon: <SearchIcon />,
        children: [{ id: "nested", label: "Nested" }],
      },
    ]
    render(<Tree items={items} variant="sidebar" />)
    expect(screen.queryByText("Nested")).toBeNull()
    // No chevron either — the row is a plain button.
    expect(
      screen.getByRole("button", { name: "Top" }).getAttribute("aria-expanded")
    ).toBeNull()
  })
})

describe("Tree · files", () => {
  test("folders toggle on row press; only leaves navigate", async () => {
    const user = userEvent.setup()
    const onNavigate = mock(() => {})
    render(<Tree items={FILES} onNavigate={onNavigate} variant="files" />)

    await user.click(screen.getByText("index.ts"))
    expect(onNavigate).toHaveBeenCalledTimes(1)

    const folder = screen.getByRole("button", { name: /^src/ })
    await user.click(folder)
    expect(onNavigate).toHaveBeenCalledTimes(1)
    await settleExit()
    expect(screen.queryByText("index.ts")).toBeNull()
  })

  test("trailing actions sit beside the row, not inside it", async () => {
    const user = userEvent.setup()
    const onDelete = mock(() => {})
    render(
      <Tree
        items={FILES}
        renderTrailing={(node) => (
          <button onClick={onDelete} type="button">
            {`Delete ${node.label}`}
          </button>
        )}
        variant="files"
      />
    )

    // A folder row is a <button> and a leaf row an <a> — either one nesting
    // the trailing button would be invalid markup React warns about.
    for (const row of document.querySelectorAll('[data-slot="tree-row"]')) {
      expect(row.querySelector("button, a")).toBeNull()
    }

    // Still wired: pressing it does not also toggle or navigate the row.
    const folder = screen.getByRole("button", { name: /^src/ })
    await user.click(screen.getByRole("button", { name: "Delete src" }))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(folder.getAttribute("aria-expanded")).toBe("true")
  })

  test("double-click renames inline; Enter commits, Escape cancels", async () => {
    const user = userEvent.setup()
    const onRename = mock(() => {})
    render(<Tree items={FILES} onRename={onRename} variant="files" />)

    await user.dblClick(screen.getByText("README.md"))
    const input = document.querySelector<HTMLInputElement>(
      '[data-slot="tree-rename-input"]'
    )
    expect(input).not.toBeNull()
    await user.clear(input as HTMLInputElement)
    await user.type(input as HTMLInputElement, "NOTES.md{Enter}")
    expect(onRename).toHaveBeenCalledWith("readme", "NOTES.md")

    // Escape leaves the label untouched.
    await user.dblClick(screen.getByText("README.md"))
    await user.keyboard("{Escape}")
    expect(onRename).toHaveBeenCalledTimes(1)
  })

  test("drag reorders around a row and drops into a folder", () => {
    const onMove = mock(() => {})
    render(<Tree items={FILES} onMove={onMove} variant="files" />)
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="tree-row"]')
    )
    const src = rows.find((row) => row.dataset.id === "src") as HTMLElement
    const readme = rows.find(
      (row) => row.dataset.id === "readme"
    ) as HTMLElement
    expect(src.getAttribute("draggable")).toBe("true")

    // happy-dom rects are zero-height, so the hook falls back to the
    // 0.5 midpoint → "inside" for folders, "after" for leaves.
    fireEvent.dragStart(readme)
    fireEvent.dragOver(src)
    fireEvent.drop(src)
    expect(onMove).toHaveBeenCalledWith("readme", "src", 2)

    // A folder never drops into its own subtree.
    onMove.mockClear()
    fireEvent.dragStart(src)
    const indexRow = rows.find(
      (row) => row.dataset.id === "index-ts"
    ) as HTMLElement
    fireEvent.dragOver(indexRow)
    fireEvent.drop(indexRow)
    expect(onMove).not.toHaveBeenCalled()
  })

  test("moveNode reducer lifts and reinserts immutably", () => {
    const next = moveNode(FILES, "readme", "src", 2)
    const src = next.find((node) => node.id === "src")
    expect(src?.children?.map((child) => child.id)).toEqual([
      "index-ts",
      "utils-ts",
      "readme",
    ])
    // Refuses a drop into the moved node's own subtree.
    expect(moveNode(FILES, "src", "index-ts", 0)).toEqual(FILES)
    // The input is untouched.
    expect(FILES.find((node) => node.id === "src")?.children?.length).toBe(2)
  })
})

describe("Tree · keyboard", () => {
  test("arrows walk visible rows; right expands, left collapses", async () => {
    const user = userEvent.setup()
    render(<Tree items={FLAT_NAV} variant="navigation" />)

    const search = screen.getByRole("link", { name: "Search" })
    search.focus()
    await user.keyboard("{ArrowDown}")
    const library = screen.getByRole("button", { name: "Library" })
    expect(document.activeElement).toBe(library)

    await user.keyboard("{ArrowRight}")
    expect(await screen.findByRole("link", { name: "Manuscripts" })).toBeDefined()
    await waitFor(() =>
      expect(library.getAttribute("aria-expanded")).toBe("true")
    )

    await user.keyboard("{ArrowLeft}")
    await settleExit()
    expect(screen.queryByRole("link", { name: "Manuscripts" })).toBeNull()
    expect(document.activeElement).toBe(library)
  })

  test("F2 starts a rename on the focused files row", async () => {
    const user = userEvent.setup()
    render(<Tree items={FILES} onRename={() => {}} variant="files" />)
    screen.getByText("README.md").closest("button")?.focus()
    await user.keyboard("{F2}")
    expect(
      document.querySelector('[data-slot="tree-rename-input"]')
    ).not.toBeNull()
  })
})
