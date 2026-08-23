import { describe, expect, mock, test } from "bun:test"
import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Tree, useTree } from "../index"
import type { TreeController, TreeNode } from "../type"

const NAV: TreeNode[] = [
  {
    id: "research",
    label: "Research",
    children: [
      { id: "search", label: "Search", href: "/search" },
      {
        id: "library",
        label: "Library",
        children: [{ id: "codices", label: "Codices", href: "/c" }],
      },
    ],
  },
]

const FILES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    defaultOpen: true,
    children: [
      { id: "index-ts", label: "index.ts" },
      { id: "utils-ts", label: "utils.ts" },
    ],
  },
  { id: "readme", label: "README.md" },
]

/** Branch exits run through AnimatePresence — let them settle before
 * querying (happy-dom serves stale results while an exit is in flight). */
const settleExit = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 400)))

describe("useTree · expansion", () => {
  test("expand, collapse and toggle drive a single node", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", items: NAV })
    )
    expect(result.current.isExpanded("library")).toBe(false)

    act(() => result.current.expand("library"))
    expect(result.current.isExpanded("library")).toBe(true)
    // Expanding twice is a no-op rather than a toggle.
    act(() => result.current.expand("library"))
    expect(result.current.isExpanded("library")).toBe(true)

    act(() => result.current.toggleExpanded("library"))
    expect(result.current.isExpanded("library")).toBe(false)
    act(() => result.current.collapse("library"))
    expect(result.current.isExpanded("library")).toBe(false)
  })

  test("expandAll opens every branch, collapseAll closes them", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", items: NAV })
    )
    act(() => result.current.expandAll())
    expect(result.current.isExpanded("research")).toBe(true)
    expect(result.current.isExpanded("library")).toBe(true)

    act(() => result.current.collapseAll())
    expect([...result.current.expandedIds]).toEqual([])
  })

  test("expandAll counts empty folders in files, not empty leaves elsewhere", () => {
    const items: TreeNode[] = [{ id: "empty", label: "empty", children: [] }]
    const { result } = renderHook(() =>
      useTree({ variant: "files", items })
    )
    act(() => result.current.expandAll())
    expect(result.current.isExpanded("empty")).toBe(true)

    const nav = renderHook(() => useTree({ variant: "navigation", items }))
    act(() => nav.result.current.expandAll())
    expect(nav.result.current.isExpanded("empty")).toBe(false)
  })

  test("reveal opens ancestors only", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", items: NAV })
    )
    act(() => result.current.reveal("codices"))
    expect(result.current.isExpanded("research")).toBe(true)
    expect(result.current.isExpanded("library")).toBe(true)
    // The revealed node itself is not opened.
    expect(result.current.isExpanded("codices")).toBe(false)
  })

  test("sectionIds names the heading rows of a 3-level navigation tree", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", items: NAV })
    )
    expect(result.current.sectioned).toBe(true)
    expect(result.current.sectionIds).toEqual(["research"])
    // Sections start open, so collapsing one is a real change.
    act(() => result.current.collapse(result.current.sectionIds[0]!))
    expect(result.current.isExpanded("research")).toBe(false)
  })

  test("onExpandedChange reports the new set", () => {
    const onExpandedChange = mock(() => {})
    const { result } = renderHook(() =>
      useTree({
        variant: "files",
        items: FILES,
        defaultExpandedIds: [],
        onExpandedChange,
      })
    )
    act(() => result.current.expand("src"))
    expect(onExpandedChange).toHaveBeenCalledWith(["src"])
  })
})

describe("useTree · rail", () => {
  test("collapsed is hook-owned from defaultCollapsed", () => {
    const onCollapsedChange = mock(() => {})
    const { result } = renderHook(() =>
      useTree({ variant: "sidebar", items: NAV, onCollapsedChange })
    )
    expect(result.current.collapsed).toBe(false)

    act(() => result.current.toggleCollapsed())
    expect(result.current.collapsed).toBe(true)
    expect(onCollapsedChange).toHaveBeenCalledWith(true)

    act(() => result.current.setCollapsed(false))
    expect(result.current.collapsed).toBe(false)
  })

  test("a controlled collapsed prop wins and setCollapsed only reports", () => {
    const onCollapsedChange = mock(() => {})
    const { result } = renderHook(() =>
      useTree({
        variant: "sidebar",
        items: NAV,
        collapsed: true,
        onCollapsedChange,
      })
    )
    act(() => result.current.setCollapsed(false))
    expect(result.current.collapsed).toBe(true)
    expect(onCollapsedChange).toHaveBeenCalledWith(false)
  })

  test("only sidebar has a rail — other variants read as expanded", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "files", items: FILES, defaultCollapsed: true })
    )
    expect(result.current.collapsed).toBe(false)
  })
})

describe("useTree · selection", () => {
  test("select runs onSelect then onNavigate and holds the active id", () => {
    const order: string[] = []
    const items: TreeNode[] = [
      { id: "a", label: "Alpha", onSelect: () => order.push("onSelect") },
      { id: "off", label: "Off", disabled: true },
    ]
    const { result } = renderHook(() =>
      useTree({
        variant: "navigation",
        items,
        onNavigate: () => order.push("onNavigate"),
      })
    )
    act(() => result.current.select("a"))
    expect(order).toEqual(["onSelect", "onNavigate"])
    expect(result.current.activeId).toBe("a")

    // Disabled and unknown nodes are inert.
    act(() => result.current.select("off"))
    act(() => result.current.select("nope"))
    expect(result.current.activeId).toBe("a")
    expect(order).toEqual(["onSelect", "onNavigate"])
  })

  test("a controlled activeId is never overwritten by select", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", items: NAV, activeId: "search" })
    )
    act(() => result.current.select("codices"))
    expect(result.current.activeId).toBe("search")
  })

  test("selecting a nested node reveals it on the next render", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", items: NAV })
    )
    act(() => result.current.select("codices"))
    expect(result.current.isExpanded("library")).toBe(true)
  })
})

describe("useTree · rename", () => {
  test("hook-owned data renames itself and leaves rename mode", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "files", defaultItems: FILES })
    )
    expect(result.current.canRename).toBe(true)

    act(() => result.current.startRename("readme"))
    expect(result.current.renamingId).toBe("readme")

    act(() => result.current.rename("readme", "  GUIDE.md  "))
    expect(result.current.renamingId).toBeNull()
    expect(result.current.getNode("readme")?.label).toBe("GUIDE.md")
  })

  test("blank and unchanged labels are dropped", () => {
    const onRename = mock(() => {})
    const { result } = renderHook(() =>
      useTree({ variant: "files", defaultItems: FILES, onRename })
    )
    act(() => result.current.rename("readme", "   "))
    act(() => result.current.rename("readme", "README.md"))
    expect(onRename).not.toHaveBeenCalled()
    expect(result.current.getNode("readme")?.label).toBe("README.md")
  })

  test("controlled data only reports the rename", () => {
    const onRename = mock(() => {})
    const { result } = renderHook(() =>
      useTree({ variant: "files", items: FILES, onRename })
    )
    act(() => result.current.rename("readme", "GUIDE.md"))
    expect(onRename).toHaveBeenCalledWith("readme", "GUIDE.md")
    expect(result.current.getNode("readme")?.label).toBe("README.md")
  })

  test("rename is off outside files and without a way to apply it", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", defaultItems: NAV })
    )
    expect(result.current.canRename).toBe(false)
    act(() => result.current.startRename("search"))
    expect(result.current.renamingId).toBeNull()

    const controlled = renderHook(() =>
      useTree({ variant: "files", items: FILES })
    )
    expect(controlled.result.current.canRename).toBe(false)
  })
})

describe("useTree · reorder", () => {
  test("move reorders hook-owned data", () => {
    const { result } = renderHook(() =>
      useTree({ variant: "files", defaultItems: FILES })
    )
    expect(result.current.canMove).toBe(true)

    act(() => result.current.move("readme", "src", 0))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.getNode("src")?.children?.[0]?.id).toBe("readme")
  })

  test("controlled data with onItemsChange gets the next tree", () => {
    const onItemsChange = mock((items: TreeNode[]) => void items)
    const { result } = renderHook(() =>
      useTree({ variant: "files", items: FILES, onItemsChange })
    )
    act(() => result.current.move("readme", null, 0))
    expect(onItemsChange).toHaveBeenCalled()
    const next = onItemsChange.mock.calls[0]![0]
    expect(next[0]!.id).toBe("readme")
    // The source array is never mutated.
    expect(FILES[0]!.id).toBe("src")
  })

  test("move is inert outside files", () => {
    const onMove = mock(() => {})
    const { result } = renderHook(() =>
      useTree({ variant: "navigation", items: NAV, onMove })
    )
    expect(result.current.canMove).toBe(false)
    act(() => result.current.move("search", null, 0))
    expect(onMove).not.toHaveBeenCalled()
  })
})

describe("Tree · controller form", () => {
  function Harness({
    onReady,
  }: {
    onReady: (tree: TreeController) => void
  }): React.ReactElement {
    const tree = useTree({ variant: "files", defaultItems: FILES })
    onReady(tree)
    return <Tree tree={tree} />
  }

  test("renders from the controller and reacts to calls made outside it", async () => {
    let tree!: TreeController
    render(<Harness onReady={(next) => (tree = next)} />)

    expect(screen.getByText("index.ts")).toBeDefined()
    await act(async () => tree.collapseAll())
    await settleExit()
    expect(screen.queryByText("index.ts")).toBeNull()

    await act(async () => tree.expand("src"))
    expect(await screen.findByText("index.ts")).toBeDefined()
  })

  test("a row press routes through the controller's select", async () => {
    const user = userEvent.setup()
    let tree!: TreeController
    render(<Harness onReady={(next) => (tree = next)} />)

    await user.click(screen.getByRole("button", { name: "README.md" }))
    expect(tree.activeId).toBe("readme")
  })

  test("startRename from outside opens the row's rename input", async () => {
    let tree!: TreeController
    render(<Harness onReady={(next) => (tree = next)} />)

    await act(async () => tree.startRename("readme"))
    const input = document.querySelector<HTMLInputElement>(
      '[data-slot="tree-rename-input"]'
    )
    expect(input?.value).toBe("README.md")
  })
})
