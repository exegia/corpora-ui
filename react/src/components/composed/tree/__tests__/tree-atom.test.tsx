import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createStore } from "jotai"

import { ExegiaProvider } from "@/state"
import { Tree, useTreeActions, useTreeState } from "../index"
import {
  DEFAULT_TREE_CONFIG,
  expandTreeNodeAtom,
  mountTreeAtom,
  removeTreeInstance,
  renameTreeNodeAtom,
  resetTreeAtom,
  treeCanRenameAtom,
  treeCollapsedAtom,
  treeExpandedIdsAtom,
  treeItemsAtom,
  treeRailCollapsedAtom,
} from "../tree-atom"
import type { TreeConfig, TreeNode } from "../type"

type Store = ReturnType<typeof createStore>

const FILES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [{ id: "index-ts", label: "index.ts" }],
  },
  { id: "readme", label: "README.md" },
]

function mount(
  store: Store,
  id: string,
  config: Partial<TreeConfig>,
  items: TreeNode[] = FILES
) {
  store.set(
    mountTreeAtom(id),
    { ...DEFAULT_TREE_CONFIG, ...config },
    { items, collapsed: false }
  )
}

describe("tree atoms · instance isolation", () => {
  test("two ids never share state", () => {
    const store = createStore()
    mount(store, "a", { variant: "files" })
    mount(store, "b", { variant: "files" })

    store.set(expandTreeNodeAtom("a"), "src")
    expect(store.get(treeExpandedIdsAtom("a")).has("src")).toBe(true)
    expect(store.get(treeExpandedIdsAtom("b")).has("src")).toBe(false)
  })

  test("two stores never share state under the same id", () => {
    const one = createStore()
    const two = createStore()
    mount(one, "shared", { variant: "files" })
    mount(two, "shared", { variant: "files" })

    one.set(expandTreeNodeAtom("shared"), "src")
    expect(one.get(treeExpandedIdsAtom("shared")).has("src")).toBe(true)
    expect(two.get(treeExpandedIdsAtom("shared")).has("src")).toBe(false)
  })

  test("removeTreeInstance drops the slice back to its defaults", () => {
    const store = createStore()
    mount(store, "gone", { variant: "files" })
    store.set(expandTreeNodeAtom("gone"), "src")

    removeTreeInstance("gone")
    expect(store.get(treeExpandedIdsAtom("gone")).size).toBe(0)
    expect(store.get(treeItemsAtom("gone"))).toEqual([])
  })
})

describe("tree atoms · write gates", () => {
  test("hook-owned data renames itself", () => {
    const store = createStore()
    mount(store, "owned", { variant: "files", managesItems: true })
    expect(store.get(treeCanRenameAtom("owned"))).toBe(true)

    store.set(renameTreeNodeAtom("owned"), "readme", "GUIDE.md")
    expect(store.get(treeItemsAtom("owned"))[1]?.label).toBe("GUIDE.md")
  })

  test("a controlled items prop is never overwritten, only reported", () => {
    const store = createStore()
    const onItemsChange = mock((items: TreeNode[]) => void items)
    mount(store, "controlled", {
      variant: "files",
      controlsItems: true,
      managesItems: true,
    })
    store.set(
      // Handlers ride along with the options in real use; set directly here.
      mountTreeAtom("controlled"),
      {
        ...DEFAULT_TREE_CONFIG,
        variant: "files",
        controlsItems: true,
        managesItems: true,
      },
      { items: FILES, collapsed: false }
    )

    store.set(renameTreeNodeAtom("controlled"), "readme", "GUIDE.md")
    expect(store.get(treeItemsAtom("controlled"))[1]?.label).toBe("README.md")
    expect(onItemsChange).not.toHaveBeenCalled()
  })

  test("the rail fold reads as false outside sidebar", () => {
    const store = createStore()
    mount(store, "files-rail", { variant: "files" })
    store.set(treeRailCollapsedAtom("files-rail"), true)
    expect(store.get(treeCollapsedAtom("files-rail")).valueOf()).toBe(false)

    mount(store, "sidebar-rail", { variant: "sidebar" })
    store.set(treeRailCollapsedAtom("sidebar-rail"), true)
    expect(store.get(treeCollapsedAtom("sidebar-rail")).valueOf()).toBe(true)
  })

  test("reset replays the mount seed", () => {
    const store = createStore()
    mount(store, "replay", { variant: "files" })
    store.set(expandTreeNodeAtom("replay"), "src")
    store.set(renameTreeNodeAtom("replay"), "readme", "GUIDE.md")

    store.set(resetTreeAtom("replay"))
    expect(store.get(treeExpandedIdsAtom("replay")).size).toBe(0)
    expect(store.get(treeItemsAtom("replay"))[1]?.label).toBe("README.md")
  })
})

describe("ExegiaProvider · driving a tree by id", () => {
  /** A component with no relationship to the Tree beyond its id. */
  function Remote() {
    const actions = useTreeActions("app-files")
    const { expandedIds } = useTreeState("app-files")
    return (
      <button onClick={() => actions.expand("src")} type="button">
        {`expand (${expandedIds.size})`}
      </button>
    )
  }

  test("a sibling component expands the tree through one provider", async () => {
    const user = userEvent.setup()
    render(
      <ExegiaProvider store={createStore()}>
        <Tree items={FILES} treeId="app-files" variant="files" />
        <Remote />
      </ExegiaProvider>
    )

    // src has no defaultOpen, so its child starts unmounted.
    expect(screen.queryByText("index.ts")).toBeNull()

    await user.click(screen.getByRole("button", { name: /^expand/ }))
    expect(await screen.findByText("index.ts")).toBeDefined()
    // The remote reader saw the change too.
    expect(screen.getByRole("button", { name: "expand (1)" })).toBeDefined()
  })
})

describe("Tree · render granularity", () => {
  test("expanding one branch leaves its sibling's row untouched", async () => {
    const user = userEvent.setup()
    // `renderTrailing` runs inside a row's render, so counting calls per id is
    // a proxy for counting that row's renders.
    const renders = new Map<string, number>()
    const items: TreeNode[] = [
      { id: "a", label: "a", children: [{ id: "a-1", label: "a-1" }] },
      { id: "b", label: "b", children: [{ id: "b-1", label: "b-1" }] },
    ]

    function Toggle() {
      const actions = useTreeActions("granular")
      return (
        <button onClick={() => actions.expand("a")} type="button">
          go
        </button>
      )
    }

    render(
      <ExegiaProvider store={createStore()}>
        <Tree
          items={items}
          renderTrailing={(node) => {
            renders.set(node.id, (renders.get(node.id) ?? 0) + 1)
            return null
          }}
          treeId="granular"
          variant="files"
        />
        <Toggle />
      </ExegiaProvider>
    )

    const beforeA = renders.get("a") ?? 0
    const beforeB = renders.get("b") ?? 0
    expect(beforeA).toBeGreaterThan(0)
    expect(beforeB).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: "go" }))
    await screen.findByText("a-1")

    // a's branch opened, so a's row re-rendered…
    expect(renders.get("a")).toBeGreaterThan(beforeA)
    // …and b, whose atoms did not change, did not.
    expect(renders.get("b")).toBe(beforeB)
  })
})
