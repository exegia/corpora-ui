import { describe, expect, mock, test } from "bun:test"
import { act, render, renderHook, screen } from "@testing-library/react"

import { AISidebar } from "../ai-sidebar"
import type { AISidebarController, SidebarResource } from "../type.ts"
import { useAISidebar } from "../use-ai-sidebar"

const RESOURCES: SidebarResource[] = [
  {
    id: "corpora",
    label: "Corpora",
    kind: "project",
    children: [
      {
        id: "manuscripts",
        label: "Manuscripts",
        kind: "folder",
        children: [{ id: "codex-a", label: "Codex Askewianus", kind: "file" }],
      },
      { id: "readme", label: "Field notes", kind: "file" },
    ],
  },
  { id: "reading-list", label: "Reading list", kind: "bookmark" },
  { id: "archive", label: "Archive", kind: "folder", disabled: true },
]

const labels = (controller: AISidebarController) =>
  controller.flat.map((row) => row.item.id)

describe("useAISidebar · expansion", () => {
  test("expand, collapse and toggle change what flattens", () => {
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES })
    )
    expect(labels(result.current)).toEqual(["corpora", "reading-list", "archive"])

    act(() => result.current.expand("corpora"))
    expect(result.current.isExpanded("corpora")).toBe(true)
    expect(labels(result.current)).toContain("manuscripts")

    // Expanding twice is a no-op rather than a toggle.
    act(() => result.current.expand("corpora"))
    expect(result.current.isExpanded("corpora")).toBe(true)

    act(() => result.current.toggleExpanded("corpora"))
    expect(result.current.isExpanded("corpora")).toBe(false)
    act(() => result.current.collapse("corpora"))
    expect(result.current.isExpanded("corpora")).toBe(false)
  })

  test("expandAll opens every container that has children", () => {
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES })
    )
    act(() => result.current.expandAll())
    expect(labels(result.current)).toEqual([
      "corpora",
      "manuscripts",
      "codex-a",
      "readme",
      "reading-list",
      "archive",
    ])
    // A childless folder is not an expandable row.
    expect(result.current.isExpanded("archive")).toBe(false)

    act(() => result.current.collapseAll())
    expect([...result.current.expandedIds]).toEqual([])
  })

  test("reveal opens ancestors only", () => {
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES })
    )
    act(() => result.current.reveal("codex-a"))
    expect(result.current.isExpanded("corpora")).toBe(true)
    expect(result.current.isExpanded("manuscripts")).toBe(true)
    expect(result.current.isExpanded("codex-a")).toBe(false)
  })

  test("controlled expandedIds win and changes are only reported", () => {
    const onExpandedChange = mock((ids: string[]) => void ids)
    const { result } = renderHook(() =>
      useAISidebar({
        defaultItems: RESOURCES,
        expandedIds: ["corpora"],
        onExpandedChange,
      })
    )
    act(() => result.current.collapse("corpora"))
    expect(result.current.isExpanded("corpora")).toBe(true)
    expect(onExpandedChange).toHaveBeenCalledWith([])
  })
})

describe("useAISidebar · selection and focus", () => {
  test("select holds the id when uncontrolled and reports either way", () => {
    const onActiveChange = mock((id: string) => void id)
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES, onActiveChange })
    )
    act(() => result.current.select("reading-list"))
    expect(result.current.selectedId).toBe("reading-list")
    expect(onActiveChange).toHaveBeenCalledWith("reading-list")

    const controlled = renderHook(() =>
      useAISidebar({
        defaultItems: RESOURCES,
        activeId: "corpora",
        onActiveChange,
      })
    )
    act(() => controlled.result.current.select("reading-list"))
    expect(controlled.result.current.selectedId).toBe("corpora")
  })

  test("focus moves the roving target, and it follows rows that fold away", () => {
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES, defaultExpandedIds: ["corpora"] })
    )
    act(() => result.current.focus("readme"))
    expect(result.current.focusedId).toBe("readme")

    // Collapsing the parent hides the focused row — focus falls back to the
    // first visible row rather than pointing at nothing.
    act(() => result.current.collapse("corpora"))
    expect(result.current.focusedId).toBe("corpora")
  })
})

describe("useAISidebar · rename", () => {
  test("renames hook-owned data and leaves rename mode", () => {
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES })
    )
    act(() => result.current.startRename("reading-list"))
    expect(result.current.renamingId).toBe("reading-list")

    act(() => result.current.rename("reading-list", "  To read  "))
    expect(result.current.renamingId).toBeNull()
    expect(result.current.getItem("reading-list")?.label).toBe("To read")
  })

  test("blank, unchanged and unknown targets are dropped", () => {
    const onRename = mock(() => {})
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES, onRename })
    )
    act(() => result.current.rename("reading-list", "   "))
    act(() => result.current.rename("reading-list", "Reading list"))
    act(() => result.current.rename("nope", "Whatever"))
    expect(onRename).not.toHaveBeenCalled()

    // Arming rename against a row that never renders is inert.
    act(() => result.current.startRename("nope"))
    expect(result.current.renamingId).toBeNull()
  })

  test("a rejected onRename rolls the label back and announces it", async () => {
    const onRename = mock(() => Promise.reject(new Error("offline")))
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES, onRename })
    )
    await act(async () => {
      result.current.rename("reading-list", "To read")
      await Promise.resolve()
    })
    expect(result.current.getItem("reading-list")?.label).toBe("Reading list")
    expect(result.current.announcement).toContain("Rename failed")
  })
})

describe("useAISidebar · reorder", () => {
  test("move reorders and announces", async () => {
    const onMove = mock(() => {})
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES, onMove })
    )
    await act(async () =>
      result.current.move({
        itemId: "reading-list",
        targetId: "corpora",
        position: "before",
      })
    )
    expect(result.current.items.map((item) => item.id)).toEqual([
      "reading-list",
      "corpora",
      "archive",
    ])
    expect(onMove).toHaveBeenCalled()
    expect(result.current.announcement).toContain("Moved Reading list before")
  })

  test("a rejected onMove restores the previous order", async () => {
    const onMoveError = mock(() => {})
    const { result } = renderHook(() =>
      useAISidebar({
        defaultItems: RESOURCES,
        onMove: () => Promise.reject(new Error("409")),
        onMoveError,
      })
    )
    await act(async () =>
      result.current.move({
        itemId: "reading-list",
        targetId: "corpora",
        position: "before",
      })
    )
    expect(result.current.items.map((item) => item.id)).toEqual([
      "corpora",
      "reading-list",
      "archive",
    ])
    expect(result.current.announcement).toContain("Move failed")
    expect(onMoveError).toHaveBeenCalled()
  })

  test("moves the data forbids are refused", async () => {
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES })
    )
    // Into its own subtree.
    await act(async () =>
      result.current.move({
        itemId: "corpora",
        targetId: "manuscripts",
        position: "inside",
      })
    )
    // Inside a row that cannot contain children.
    await act(async () =>
      result.current.move({
        itemId: "corpora",
        targetId: "reading-list",
        position: "inside",
      })
    )
    expect(result.current.items.map((item) => item.id)).toEqual([
      "corpora",
      "reading-list",
      "archive",
    ])
  })
})

describe("useAISidebar · menu", () => {
  test("openMenu and closeMenu track one row at a time", () => {
    const { result } = renderHook(() =>
      useAISidebar({ defaultItems: RESOURCES })
    )
    act(() => result.current.openMenu("reading-list"))
    expect(result.current.menuOpenId).toBe("reading-list")

    act(() => result.current.openMenu("nope"))
    expect(result.current.menuOpenId).toBe("reading-list")

    act(() => result.current.closeMenu())
    expect(result.current.menuOpenId).toBeNull()
  })
})

describe("AISidebar · controller form", () => {
  function Harness({
    onReady,
  }: {
    onReady: (controller: AISidebarController) => void
  }) {
    const controller = useAISidebar({ defaultItems: RESOURCES })
    onReady(controller)
    return <AISidebar controller={controller} />
  }

  test("renders from the controller and reacts to calls made outside it", async () => {
    let sidebar!: AISidebarController
    render(<Harness onReady={(next) => (sidebar = next)} />)
    expect(screen.queryByRole("treeitem", { name: /Field notes/ })).toBeNull()

    await act(async () => sidebar.expandAll())
    expect(screen.getByRole("treeitem", { name: /Field notes/ })).toBeDefined()

    await act(async () => sidebar.select("readme"))
    expect(
      screen.getByRole("treeitem", { name: /Field notes/ }).getAttribute("aria-selected")
    ).toBe("true")
  })

  // Rename mode is not asserted through the rendered row here: mounting the
  // input makes happy-dom fire focus/blur, and the row's blur handler
  // commits and closes rename mode before an assertion can run. The hook
  // tests above cover the state; the browser covers the rendering.

  test("a move made from outside reorders the rendered rows", async () => {
    let sidebar!: AISidebarController
    render(<Harness onReady={(next) => (sidebar = next)} />)

    await act(async () =>
      sidebar.move({
        itemId: "reading-list",
        targetId: "corpora",
        position: "before",
      })
    )
    const rows = screen
      .getAllByRole("treeitem")
      .map((row) => row.getAttribute("aria-label") ?? row.textContent)
    expect(rows[0]).toContain("Reading list")
  })
})
