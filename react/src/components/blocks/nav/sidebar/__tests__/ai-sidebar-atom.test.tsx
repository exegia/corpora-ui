import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createStore } from "jotai"

import { ExegiaProvider } from "@/state"
import { AISidebar } from "../ai-sidebar"
import {
  DEFAULT_AI_SIDEBAR_CONFIG,
  aiSidebarAnnouncementAtom,
  aiSidebarExpandedIdsAtom,
  aiSidebarItemsAtom,
  aiSidebarMovePendingAtom,
  expandAISidebarRowAtom,
  mountAISidebarAtom,
  moveAISidebarRowAtom,
  removeAISidebarInstance,
  renameAISidebarRowAtom,
  resetAISidebarAtom,
  setAISidebarHandlersAtom,
} from "../ai-sidebar-atom"
import type { AISidebarConfig, AISidebarSeed, SidebarResource } from "../type"
import { useAISidebarActions, useAISidebarState } from "../use-ai-sidebar-state"

type Store = ReturnType<typeof createStore>

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
  { id: "archive", label: "Archive", kind: "folder", disabled: true },
]

function mount(
  store: Store,
  id: string,
  config: Partial<AISidebarConfig> = {},
  seed: Partial<AISidebarSeed> = {}
) {
  store.set(
    mountAISidebarAtom(id),
    { ...DEFAULT_AI_SIDEBAR_CONFIG, ...config },
    {
      items: RESOURCES,
      activeId: null,
      focusedId: null,
      expandedIds: [],
      ...seed,
    }
  )
}

const ids = (items: SidebarResource[]) => items.map((item) => item.id)

describe("ai-sidebar atoms · instance isolation", () => {
  test("two ids never share state", () => {
    const store = createStore()
    mount(store, "a")
    mount(store, "b")

    store.set(expandAISidebarRowAtom("a"), "corpora")
    expect(store.get(aiSidebarExpandedIdsAtom("a")).has("corpora")).toBe(true)
    expect(store.get(aiSidebarExpandedIdsAtom("b")).has("corpora")).toBe(false)
  })

  test("two stores never share state under the same id", () => {
    const one = createStore()
    const two = createStore()
    mount(one, "shared")
    mount(two, "shared")

    one.set(expandAISidebarRowAtom("shared"), "corpora")
    expect(one.get(aiSidebarExpandedIdsAtom("shared")).has("corpora")).toBe(
      true
    )
    expect(two.get(aiSidebarExpandedIdsAtom("shared")).has("corpora")).toBe(
      false
    )
  })

  test("removeAISidebarInstance drops the slice back to its defaults", () => {
    const store = createStore()
    mount(store, "gone")
    store.set(expandAISidebarRowAtom("gone"), "corpora")

    removeAISidebarInstance("gone")
    expect(store.get(aiSidebarExpandedIdsAtom("gone")).size).toBe(0)
    expect(store.get(aiSidebarItemsAtom("gone"))).toEqual([])
  })
})

describe("ai-sidebar atoms · write gates", () => {
  test("hook-owned data renames itself", () => {
    const store = createStore()
    mount(store, "owned")

    store.set(renameAISidebarRowAtom("owned"), "reading-list", "  To read  ")
    expect(store.get(aiSidebarItemsAtom("owned"))[1]?.label).toBe("To read")
  })

  test("a controlled items prop is never overwritten, only reported", () => {
    const store = createStore()
    const onItemsChange = mock((items: SidebarResource[]) => void items)
    mount(store, "controlled", { controlsItems: true })
    store.set(setAISidebarHandlersAtom("controlled"), { onItemsChange })

    store.set(renameAISidebarRowAtom("controlled"), "reading-list", "To read")
    expect(store.get(aiSidebarItemsAtom("controlled"))[1]?.label).toBe(
      "Reading list"
    )
    expect(onItemsChange).toHaveBeenCalledTimes(1)
    expect(onItemsChange.mock.calls[0]![0][1]?.label).toBe("To read")

    // A move is gated the same way: the atom keeps the prop's data, the
    // consumer gets the next tree to apply themselves.
    void store.set(moveAISidebarRowAtom("controlled"), {
      itemId: "reading-list",
      targetId: "corpora",
      position: "before",
    })
    expect(ids(store.get(aiSidebarItemsAtom("controlled")))).toEqual([
      "corpora",
      "reading-list",
      "archive",
    ])
    expect(onItemsChange).toHaveBeenCalledTimes(2)
    expect(ids(onItemsChange.mock.calls[1]![0])).toEqual([
      "reading-list",
      "corpora",
      "archive",
    ])
  })

  test("reset replays the mount seed", () => {
    const store = createStore()
    mount(store, "replay", {}, { expandedIds: ["corpora"] })
    store.set(expandAISidebarRowAtom("replay"), "manuscripts")
    store.set(renameAISidebarRowAtom("replay"), "reading-list", "To read")

    store.set(resetAISidebarAtom("replay"))
    expect([...store.get(aiSidebarExpandedIdsAtom("replay"))]).toEqual([
      "corpora",
    ])
    expect(store.get(aiSidebarItemsAtom("replay"))[1]?.label).toBe(
      "Reading list"
    )
    expect(store.get(aiSidebarAnnouncementAtom("replay"))).toBe("")
  })
})

describe("ai-sidebar atoms · optimistic move", () => {
  test("a rejected onMove rolls the data back and announces it", async () => {
    const store = createStore()
    const onMoveError = mock(() => {})
    mount(store, "rollback")
    store.set(setAISidebarHandlersAtom("rollback"), {
      onMove: () => Promise.reject(new Error("409")),
      onMoveError,
    })

    const pending = store.set(moveAISidebarRowAtom("rollback"), {
      itemId: "reading-list",
      targetId: "corpora",
      position: "before",
    })
    // The move applies optimistically and announces before onMove settles…
    expect(ids(store.get(aiSidebarItemsAtom("rollback")))).toEqual([
      "reading-list",
      "corpora",
      "archive",
    ])
    expect(store.get(aiSidebarAnnouncementAtom("rollback"))).toContain(
      "Moved Reading list before Corpora"
    )

    await pending
    // …and the rejection restores the previous order.
    expect(ids(store.get(aiSidebarItemsAtom("rollback")))).toEqual([
      "corpora",
      "reading-list",
      "archive",
    ])
    expect(store.get(aiSidebarAnnouncementAtom("rollback"))).toContain(
      "Move failed"
    )
    expect(onMoveError).toHaveBeenCalled()
    expect(store.get(aiSidebarMovePendingAtom("rollback"))).toBe(false)
  })

  test("a second move is refused while one is in flight", async () => {
    const store = createStore()
    let release!: () => void
    mount(store, "pending")
    store.set(setAISidebarHandlersAtom("pending"), {
      onMove: () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    })

    const first = store.set(moveAISidebarRowAtom("pending"), {
      itemId: "reading-list",
      targetId: "corpora",
      position: "before",
    })
    const second = store.set(moveAISidebarRowAtom("pending"), {
      itemId: "archive",
      targetId: "corpora",
      position: "before",
    })
    // The second move never touched the data, only the live region.
    expect(store.get(aiSidebarAnnouncementAtom("pending"))).toBe(
      "Wait for the current move to finish."
    )
    expect(ids(store.get(aiSidebarItemsAtom("pending")))).toEqual([
      "reading-list",
      "corpora",
      "archive",
    ])

    release()
    await Promise.all([first, second])
    expect(store.get(aiSidebarMovePendingAtom("pending"))).toBe(false)
  })
})

describe("ExegiaProvider · driving a sidebar by id", () => {
  /** A component with no relationship to the sidebar beyond its id. */
  function Remote() {
    const actions = useAISidebarActions("app-resources")
    const { expandedIds } = useAISidebarState("app-resources")
    return (
      <button onClick={() => actions.expand("corpora")} type="button">
        {`expand (${expandedIds.size})`}
      </button>
    )
  }

  test("a sibling component expands the sidebar through one provider", async () => {
    const user = userEvent.setup()
    render(
      <ExegiaProvider store={createStore()}>
        <AISidebar defaultItems={RESOURCES} sidebarId="app-resources" />
        <Remote />
      </ExegiaProvider>
    )

    // corpora starts collapsed, so its children start unmounted.
    expect(screen.queryByRole("treeitem", { name: /Field notes/ })).toBeNull()

    await user.click(screen.getByRole("button", { name: /^expand/ }))
    expect(
      await screen.findByRole("treeitem", { name: /Field notes/ })
    ).toBeDefined()
    // The remote reader saw the change too.
    expect(screen.getByRole("button", { name: "expand (1)" })).toBeDefined()
  })
})

describe("AISidebar · render granularity", () => {
  test("expanding and selecting one row leave a sibling row untouched", async () => {
    const user = userEvent.setup()
    // `renderIcon` runs inside a row's render, so counting calls per id is a
    // proxy for counting that row's renders.
    const renders = new Map<string, number>()

    function Driver() {
      const actions = useAISidebarActions("granular")
      return (
        <>
          <button onClick={() => actions.expand("corpora")} type="button">
            open
          </button>
          <button onClick={() => actions.select("reading-list")} type="button">
            pick
          </button>
        </>
      )
    }

    render(
      <ExegiaProvider store={createStore()}>
        <AISidebar
          defaultItems={RESOURCES}
          renderIcon={(item) => {
            renders.set(item.id, (renders.get(item.id) ?? 0) + 1)
            return null
          }}
          sidebarId="granular"
        />
        <Driver />
      </ExegiaProvider>
    )

    const beforeCorpora = renders.get("corpora") ?? 0
    const beforeReadingList = renders.get("reading-list") ?? 0
    const beforeArchive = renders.get("archive") ?? 0
    expect(beforeCorpora).toBeGreaterThan(0)
    expect(beforeReadingList).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: "open" }))
    await screen.findByRole("treeitem", { name: /Field notes/ })

    // corpora's branch opened, so its row re-rendered…
    expect(renders.get("corpora")).toBeGreaterThan(beforeCorpora)
    // …and its siblings, whose atoms did not change, did not.
    expect(renders.get("reading-list")).toBe(beforeReadingList)
    expect(renders.get("archive")).toBe(beforeArchive)

    const expandedCorpora = renders.get("corpora") ?? 0
    await user.click(screen.getByRole("button", { name: "pick" }))

    // Selection flips reading-list's own atom and nobody else's.
    expect(renders.get("reading-list")).toBeGreaterThan(beforeReadingList)
    expect(renders.get("corpora")).toBe(expandedCorpora)
    expect(renders.get("archive")).toBe(beforeArchive)
  })
})
