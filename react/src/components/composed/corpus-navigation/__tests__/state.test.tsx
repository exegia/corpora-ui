import { StrictMode } from "react"
import { afterEach, describe, expect, test } from "bun:test"
import { act, cleanup, render, waitFor } from "@testing-library/react"
import { createStore, Provider } from "jotai"
import {
  bindCorpusNavigationAtom,
  corpusNavigationStateAtom,
  commitCorpusLocationAtom,
  selectCorpusLocationAtom,
  cancelCorpusNavigationAtom,
  returnCorpusLocationAtom,
  searchCorpusAtom,
  removeCorpusNavigationInstance,
} from "../corpus-navigation-atom"
import { useCorpusNavigation } from "../use-corpus-navigation"
import { useCorpusNavigationActions } from "../use-corpus-navigation-state"
import { anchorFor, referenceResults, indexCorpus } from "../utils"
import { corpusSchemas } from "../adapters"
import { bible } from "./fixtures"
import type { CorpusAnchor, CorpusData } from "../types"

afterEach(cleanup)
function setup(
  data = bible(),
  id = "test",
  controlled = false,
  onNavigate?: (a: CorpusAnchor) => void
) {
  const store = createStore()
  store.set(bindCorpusNavigationAtom(id), {
    data,
    controlled,
    location: anchorFor(data, "john-1-1"),
    historyLimit: 2,
    onNavigate,
  })
  return { store, data, read: () => store.get(corpusNavigationStateAtom(id)) }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
describe("corpus state", () => {
  test("draft, cancel, commit, return and history bounds", async () => {
    const { store, data, read } = setup()
    const a = (n: number) => anchorFor(data, `john-1-${n}`)
    store.set(selectCorpusLocationAtom("test"), a(2))
    expect(read().location).toEqual(a(1))
    store.set(cancelCorpusNavigationAtom("test"))
    expect(read().draft).toEqual(a(1))
    for (const n of [2, 3, 4])
      await store.set(commitCorpusLocationAtom("test"), a(n))
    expect(read().history).toEqual([a(2), a(3)])
    await store.set(returnCorpusLocationAtom("test"))
    expect(read().location).toEqual(a(3))
    expect(read().history).toEqual([a(2)])
  })
  test("same ID coordinates while instances and provider stores remain independent", async () => {
    const one = setup()
    const two = setup()
    one.store.set(bindCorpusNavigationAtom("other"), {
      data: one.data,
      controlled: false,
      location: null,
      historyLimit: 20,
    })
    await one.store.set(
      commitCorpusLocationAtom("test"),
      anchorFor(one.data, "john-1-2")
    )
    expect(
      one.store.get(corpusNavigationStateAtom("test")).location?.nodeId
    ).toBe("john-1-2")
    expect(two.read().location?.nodeId).toBe("john-1-1")
    expect(
      one.store.get(corpusNavigationStateAtom("other")).location
    ).toBeNull()
  })
  test("controlled location waits for props; duplicate activation calls back once", async () => {
    const calls: CorpusAnchor[] = []
    const { store, data, read } = setup(bible(), "test", true, (a) =>
      calls.push(a)
    )
    const anchor = anchorFor(data, "john-1-2")
    await store.set(commitCorpusLocationAtom("test"), anchor)
    await store.set(commitCorpusLocationAtom("test"), anchor)
    expect(calls).toEqual([anchor])
    store.set(cancelCorpusNavigationAtom("test"))
    await store.set(commitCorpusLocationAtom("test"), anchor)
    expect(calls).toHaveLength(2)
    expect(read().location?.nodeId).toBe("john-1-1")
    expect(read().history).toHaveLength(0)
    store.set(bindCorpusNavigationAtom("test"), {
      data,
      controlled: true,
      location: anchor,
      historyLimit: 2,
    })
    expect(read().location).toEqual(anchor)
    expect(read().history).toHaveLength(1)
  })
  test("cancelled resolution cannot move the reader and failures allow retry", async () => {
    const request = deferred<CorpusAnchor>()
    const data = bible()
    data.resolve = () => request.promise
    const { store, read } = setup(data)
    const task = store.set(
      commitCorpusLocationAtom("test"),
      anchorFor(data, "john-1-2")
    )
    store.set(cancelCorpusNavigationAtom("test"))
    request.resolve(anchorFor(data, "john-1-2"))
    await task
    expect(read().location?.nodeId).toBe("john-1-1")
    data.resolve = () => Promise.reject(new Error("Offline"))
    await store.set(
      commitCorpusLocationAtom("test"),
      anchorFor(data, "john-1-2")
    )
    expect(read().error).toBe("Offline")
    data.resolve = (a) => Promise.resolve(a)
    await store.set(
      commitCorpusLocationAtom("test"),
      anchorFor(data, "john-1-2")
    )
    expect(read().location?.nodeId).toBe("john-1-2")
  })
  test("out-of-order search and old-edition commits are discarded", async () => {
    const old = deferred<[]>()
    const fresh = deferred<[]>()
    const data = bible()
    data.search = (q) => (q === "old" ? old.promise : fresh.promise)
    const { store, read } = setup(data)
    const one = store.set(searchCorpusAtom("test"), "old")
    const two = store.set(searchCorpusAtom("test"), "new")
    fresh.resolve([])
    await two
    old.reject(new Error("stale"))
    await one
    expect(read().query).toBe("new")
    expect(read().searchError).toBeNull()
    const resolve = deferred<CorpusAnchor>()
    data.resolve = () => resolve.promise
    const pending = store.set(
      commitCorpusLocationAtom("test"),
      anchorFor(data, "john-1-2")
    )
    store.set(bindCorpusNavigationAtom("test"), {
      data: { ...data, editionId: "new" },
      controlled: false,
      location: null,
      historyLimit: 20,
    })
    resolve.resolve(anchorFor(data, "john-1-2"))
    await pending
    expect(read().location).toBeNull()
    expect(read().results).toEqual([])
    store.set(bindCorpusNavigationAtom("test"), {
      data,
      controlled: false,
      location: null,
      historyLimit: 20,
    })
    expect(read().location?.nodeId).toBe("john-1-1")
  })
  test("reference matches precede deduplicated text results", async () => {
    const data = bible()
    data.search = async () => [
      { anchor: anchorFor(data, "john-1-3"), label: "Text" },
      { anchor: anchorFor(data, "john-1-5"), label: "duplicate" },
    ]
    const { store, read } = setup(data)
    await store.set(searchCorpusAtom("test"), "Jn 1:5")
    expect(read().results.map((r) => r.kind)).toEqual(["reference", "text"])
  })
  test("exact bounds and partial ancestors; supplied optional levels and custom schemas", () => {
    const data = bible()
    expect(referenceResults(data, "John 1:5")[0]?.anchor.nodeId).toBe(
      "john-1-5"
    )
    expect(referenceResults(data, "John 1:6")).toEqual([])
    expect(referenceResults(data, "John 1")[0]?.anchor.nodeId).toBe("john-1")
    for (const schema of Object.values(corpusSchemas)) {
      const required = schema.levels.filter((l) => !l.optional)
      const levels = required.length ? required : schema.levels.slice(0, 1)
      let nodes: CorpusData["nodes"] = []
      for (const level of [...levels].reverse())
        nodes = [
          {
            id: level.id,
            level: level.id,
            label: level.label,
            children: nodes,
          },
        ]
      expect(indexCorpus({ ...data, schema, nodes }).size).toBe(levels.length)
    }
    const custom = {
      ...data,
      schema: {
        id: "custom",
        label: "Letters",
        levels: [{ id: "letter", label: "Letter", kind: "hierarchy" as const }],
      },
      nodes: [{ id: "a", level: "letter", label: "A" }],
    }
    expect(referenceResults(custom, "A")[0]?.anchor.nodeId).toBe("a")
    expect(() =>
      indexCorpus({ ...data, nodes: [...data.nodes, ...data.nodes] })
    ).toThrow("Duplicate")
  })
  test("inline controlled data does not loop; actions do not subscribe; generated IDs clean up", async () => {
    const store = createStore()
    let id = ""
    let renders = 0
    let actionRenders = 0
    function Actions() {
      useCorpusNavigationActions("named")
      actionRenders++
      return null
    }
    function Owner() {
      const nav = useCorpusNavigation({
        data: bible(),
        location: {
          corpusId: "bible",
          editionId: "sample",
          nodeId: "john-1-1",
        },
      })
      id = nav.navigatorId
      renders++
      return <span>{nav.location?.nodeId}</span>
    }
    const view = render(
      <Provider store={store}>
        <StrictMode>
          <Owner />
        </StrictMode>
        <Actions />
      </Provider>
    )
    await waitFor(() => expect(view.getByText("john-1-1")).toBeTruthy())
    const before = actionRenders
    await act(async () => {
      store.set(bindCorpusNavigationAtom("named"), {
        data: bible(),
        controlled: false,
        location: null,
        historyLimit: 20,
      })
      store.set(
        selectCorpusLocationAtom("named"),
        anchorFor(bible(), "john-1-2")
      )
    })
    expect(actionRenders).toBe(before)
    expect(renders).toBeLessThan(10)
    const oldAtom = corpusNavigationStateAtom(id)
    view.unmount()
    await waitFor(() => expect(corpusNavigationStateAtom(id)).not.toBe(oldAtom))
    removeCorpusNavigationInstance("named")
  })
})
