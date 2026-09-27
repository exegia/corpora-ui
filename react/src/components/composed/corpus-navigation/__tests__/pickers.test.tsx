import { afterEach, expect, test } from "bun:test"
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react"
import { createStore, Provider } from "jotai"
import {
  bindCorpusNavigationAtom,
  selectCorpusLocationAtom,
  corpusNavigationStateAtom,
} from "../corpus-navigation-atom"
import LocationGrid from "../location-grid"
import HierarchyPicker from "../hierarchy-picker"
import LocationBar from "../location-bar"
import { bible } from "./fixtures"
import { anchorFor } from "../utils"
import { corpusSchemas } from "../adapters"
import type { CorpusData } from "../types"
afterEach(cleanup)
function bind(data: CorpusData, nodeId: string) {
  const store = createStore()
  store.set(bindCorpusNavigationAtom("picker"), {
    data,
    controlled: false,
    location: anchorFor(data, nodeId),
    historyLimit: 20,
  })
  return store
}
test("grid preview, keyboard focus and previous/next preserve boundaries", async () => {
  const data = bible()
  const store = bind(data, "john-1-1")
  const view = render(
    <Provider store={store}>
      <LocationGrid navigatorId="picker" levelId="verse" />
      <LocationBar navigatorId="picker" />
    </Provider>
  )
  expect(
    (
      view.getByRole("button", {
        name: "Previous location",
      }) as HTMLButtonElement
    ).disabled
  ).toBe(true)
  const first = view.getByRole("button", { name: "Verse 1" })
  act(() => first.focus())
  fireEvent.keyDown(first, { key: "ArrowRight" })
  expect(document.activeElement).toBe(
    view.getByRole("button", { name: "Verse 2" })
  )
  fireEvent.click(view.getByRole("button", { name: "Verse 3" }))
  expect(store.get(corpusNavigationStateAtom("picker")).draft?.nodeId).toBe(
    "john-1-3"
  )
  expect(store.get(corpusNavigationStateAtom("picker")).location?.nodeId).toBe(
    "john-1-1"
  )
  fireEvent.click(view.getByRole("button", { name: "Next location" }))
  await waitFor(() =>
    expect(
      store.get(corpusNavigationStateAtom("picker")).location?.nodeId
    ).toBe("john-1-2")
  )
})
test("a long numeric range stays bounded and direct entry reaches the end", () => {
  const data: CorpusData = {
    corpusId: "paper",
    editionId: "print",
    label: "Paper",
    schema: corpusSchemas.paper,
    nodes: Array.from({ length: 2000 }, (_, i) => ({
      id: `page-${i + 1}`,
      label: String(i + 1),
      reference: String(i + 1),
      level: "page",
    })),
  }
  const store = bind(data, "page-1")
  const view = render(
    <Provider store={store}>
      <LocationGrid navigatorId="picker" levelId="page" />
    </Provider>
  )
  expect(view.getAllByRole("gridcell")).toHaveLength(60)
  fireEvent.change(view.getByRole("textbox", { name: "Find page" }), {
    target: { value: "2000" },
  })
  fireEvent.click(view.getByRole("button", { name: "Page 2000" }))
  expect(store.get(corpusNavigationStateAtom("picker")).draft?.nodeId).toBe(
    "page-2000"
  )
  expect(view.getAllByRole("gridcell")).toHaveLength(1)
})
test("hierarchy selection changes draft without hash navigation", async () => {
  const data = bible()
  const store = bind(data, "john-1-1")
  const hash = window.location.hash
  const view = render(
    <Provider store={store}>
      <HierarchyPicker navigatorId="picker" />
    </Provider>
  )
  fireEvent.click(await view.findByRole("button", { name: "John" }))
  expect(store.get(corpusNavigationStateAtom("picker")).draft?.nodeId).toBe(
    "john"
  )
  expect(store.get(corpusNavigationStateAtom("picker")).location?.nodeId).toBe(
    "john-1-1"
  )
  expect(window.location.hash).toBe(hash)
})
test("all preset optional levels render only supplied choices", () => {
  for (const schema of Object.values(corpusSchemas)) {
    const numeric = schema.levels.find((level) => level.kind === "number")!
    const before = schema.levels
      .slice(0, schema.levels.indexOf(numeric))
      .filter((level) => !level.optional)
    let nodes: CorpusData["nodes"] = [
      { id: "target", label: "1", reference: "1", level: numeric.id },
    ]
    for (const level of [...before].reverse())
      nodes = [
        { id: level.id, label: level.label, level: level.id, children: nodes },
      ]
    const data = {
      corpusId: schema.id,
      editionId: "sample",
      label: schema.label,
      schema,
      nodes,
    }
    const view = render(
      <Provider store={bind(data, "target")}>
        <LocationGrid navigatorId="picker" levelId={numeric.id} />
      </Provider>
    )
    expect(
      view.getByRole("grid", { name: `${numeric.label} choices` })
    ).toBeTruthy()
    view.unmount()
  }
})

test("changing numeric parent clears a hidden filter and preserves reachability", () => {
  const data = bible()
  data.nodes = [
    {
      id: "john",
      label: "John",
      level: "book",
      children: [40, 3].map((count, c) => ({
        id: `c${c}`,
        label: String(c + 1),
        level: "chapter",
        children: Array.from({ length: count }, (_, v) => ({
          id: `c${c}v${v + 1}`,
          label: String(v + 1),
          level: "verse",
        })),
      })),
    },
  ]
  const store = bind(data, "c0v1")
  const view = render(
    <Provider store={store}>
      <LocationGrid navigatorId="picker" levelId="verse" />
    </Provider>
  )
  fireEvent.change(view.getByRole("textbox", { name: "Find verse" }), {
    target: { value: "39" },
  })
  expect(view.getAllByRole("gridcell")).toHaveLength(1)
  act(() =>
    store.set(selectCorpusLocationAtom("picker"), anchorFor(data, "c1"))
  )
  expect(view.getAllByRole("gridcell")).toHaveLength(3)
  expect(view.queryByRole("textbox", { name: "Find verse" })).toBeNull()
})

test("custom hierarchy after a numeric level remains reachable", async () => {
  const data: CorpusData = {
    corpusId: "custom",
    editionId: "one",
    label: "Custom",
    schema: {
      id: "custom",
      label: "Volumes",
      levels: [
        { id: "volume", label: "Volume", kind: "number" },
        { id: "section", label: "Section", kind: "hierarchy" },
      ],
    },
    nodes: [
      {
        id: "volume-1",
        level: "volume",
        label: "1",
        children: [{ id: "intro", level: "section", label: "Introduction" }],
      },
    ],
  }
  const store = bind(data, "volume-1")
  const view = render(
    <Provider store={store}>
      <HierarchyPicker navigatorId="picker" />
    </Provider>
  )
  fireEvent.click(await view.findByRole("button", { name: "Introduction" }))
  expect(store.get(corpusNavigationStateAtom("picker")).draft?.nodeId).toBe(
    "intro"
  )
})
