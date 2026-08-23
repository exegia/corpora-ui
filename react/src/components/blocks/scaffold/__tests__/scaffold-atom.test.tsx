import { describe, expect, mock, test } from "bun:test"
import { createStore } from "jotai"

import {
  measureScaffoldCanvasAtom,
  projectScaffoldPropsAtom,
  registerScaffoldPanelIdsAtom,
  removeScaffoldInstance,
  resetScaffoldAtom,
  scaffoldHiddenPanelIdsAtom,
  scaffoldHoveredPanelIdAtom,
  scaffoldInspectorOpenAtom,
  scaffoldPanelCapacityAtom,
  scaffoldPanelDimmedAtom,
  scaffoldPanelHiddenAtom,
  scaffoldStateAtom,
  scaffoldVisibilityAtom,
  setScaffoldHandlersAtom,
  setScaffoldInspectorOpenAtom,
  setScaffoldPanelHoveredAtom,
  toggleScaffoldInspectorAtom,
  toggleScaffoldPanelAtom,
} from "../scaffold-atom"

type Store = ReturnType<typeof createStore>

let keys = 0
/** A fresh instance per test — ids never collide, no cross-test state. */
const instance = () => `scaffold-test-${keys++}`

/** Register three panels on a canvas wide enough for all of them. */
function mountThree(store: Store, id: string) {
  store.set(registerScaffoldPanelIdsAtom(id), ["one", "two", "three"])
  store.set(measureScaffoldCanvasAtom(id), 1200)
}

describe("scaffold panel visibility atoms", () => {
  test("narrowing evicts the least-recently-activated panel; widening restores it", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual([])

    // Two panels' worth of room.
    store.set(measureScaffoldCanvasAtom(id), 700)
    expect(store.get(scaffoldPanelCapacityAtom(id))).toBe(2)
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual(["one"])
    expect(store.get(scaffoldPanelHiddenAtom(id, "one"))).toBe(true)
    expect(store.get(scaffoldPanelHiddenAtom(id, "two"))).toBe(false)

    // Room returns — the auto-hidden panel comes back by itself.
    store.set(measureScaffoldCanvasAtom(id), 1200)
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual([])
  })

  test("showing a hidden panel past capacity trades places with the oldest visible one", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)
    store.set(measureScaffoldCanvasAtom(id), 700)
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual(["one"])

    store.set(toggleScaffoldPanelAtom(id), "one")
    expect(store.get(scaffoldPanelHiddenAtom(id, "one"))).toBe(false)
    expect(store.get(scaffoldPanelHiddenAtom(id, "two"))).toBe(true)
  })

  test("user-hidden panels stay hidden when the canvas widens; a press shows them again", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)

    store.set(toggleScaffoldPanelAtom(id), "two")
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual(["two"])

    store.set(measureScaffoldCanvasAtom(id), 1400)
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual(["two"])

    store.set(toggleScaffoldPanelAtom(id), "two")
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual([])
  })

  test("the last visible panel refuses to hide; unknown ids are inert", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)
    store.set(measureScaffoldCanvasAtom(id), 400)
    expect(store.get(scaffoldPanelCapacityAtom(id))).toBe(1)
    expect(store.get(scaffoldPanelHiddenAtom(id, "three"))).toBe(false)

    store.set(toggleScaffoldPanelAtom(id), "three")
    expect(store.get(scaffoldPanelHiddenAtom(id, "three"))).toBe(false)

    store.set(toggleScaffoldPanelAtom(id), "nonexistent")
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual(["one", "two"])
  })

  test("departed panels are pruned from every list on re-registration", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)
    store.set(toggleScaffoldPanelAtom(id), "two")

    store.set(registerScaffoldPanelIdsAtom(id), ["one", "three"])
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual([])
  })

  test("a resize that lands on the same capacity leaves the visibility untouched", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)
    const before = store.get(scaffoldVisibilityAtom(id))

    // 1200 → 1000 both fit three panels.
    store.set(measureScaffoldCanvasAtom(id), 1000)
    expect(store.get(scaffoldVisibilityAtom(id))).toBe(before)
  })
})

describe("scaffold hover atoms", () => {
  test("hover spotlights one panel; a stale leave never clears a newer hover", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)

    store.set(setScaffoldPanelHoveredAtom(id), "one", true)
    expect(store.get(scaffoldPanelDimmedAtom(id, "one"))).toBe(false)
    expect(store.get(scaffoldPanelDimmedAtom(id, "two"))).toBe(true)

    // The pointer moved on before "one"'s leave fired.
    store.set(setScaffoldPanelHoveredAtom(id), "two", true)
    store.set(setScaffoldPanelHoveredAtom(id), "one", false)
    expect(store.get(scaffoldHoveredPanelIdAtom(id))).toBe("two")

    store.set(setScaffoldPanelHoveredAtom(id), "two", false)
    expect(store.get(scaffoldHoveredPanelIdAtom(id))).toBe(null)
    expect(store.get(scaffoldPanelDimmedAtom(id, "one"))).toBe(false)
  })

  test("the empty-key sentinel reads false however the scaffold moves", () => {
    const store = createStore()
    const id = instance()
    store.set(setScaffoldPanelHoveredAtom(id), "one", true)
    expect(store.get(scaffoldPanelDimmedAtom(id, ""))).toBe(false)
    expect(store.get(scaffoldPanelHiddenAtom(id, ""))).toBe(false)
  })
})

describe("scaffold inspector atoms", () => {
  test("set and toggle report through the handler and write the store when uncontrolled", () => {
    const store = createStore()
    const id = instance()
    const onInspectorOpenChange = mock(() => {})
    store.set(setScaffoldHandlersAtom(id), { onInspectorOpenChange })

    store.set(setScaffoldInspectorOpenAtom(id), true)
    expect(store.get(scaffoldInspectorOpenAtom(id))).toBe(true)
    expect(onInspectorOpenChange).toHaveBeenCalledWith(true)

    // Setting the value it already holds is silent.
    store.set(setScaffoldInspectorOpenAtom(id), true)
    expect(onInspectorOpenChange).toHaveBeenCalledTimes(1)

    store.set(toggleScaffoldInspectorAtom(id))
    expect(store.get(scaffoldInspectorOpenAtom(id))).toBe(false)
    expect(onInspectorOpenChange).toHaveBeenLastCalledWith(false)
  })

  test("a controlled inspector gates store writes; actions only report", () => {
    const store = createStore()
    const id = instance()
    const onInspectorOpenChange = mock(() => {})
    store.set(setScaffoldHandlersAtom(id), { onInspectorOpenChange })
    store.set(projectScaffoldPropsAtom(id), { controlsInspector: true }, false)

    store.set(setScaffoldInspectorOpenAtom(id), true)
    expect(store.get(scaffoldInspectorOpenAtom(id))).toBe(false)
    expect(onInspectorOpenChange).toHaveBeenCalledWith(true)

    // The prop coming back around through the projection is what moves it.
    store.set(projectScaffoldPropsAtom(id), { controlsInspector: true }, true)
    expect(store.get(scaffoldInspectorOpenAtom(id))).toBe(true)
  })
})

describe("scaffold instance lifecycle", () => {
  test("reset restores every field; remove drops the id from every family", () => {
    const store = createStore()
    const id = instance()
    mountThree(store, id)
    store.set(measureScaffoldCanvasAtom(id), 700)
    store.set(setScaffoldInspectorOpenAtom(id), true)
    store.set(setScaffoldPanelHoveredAtom(id), "two", true)

    store.set(resetScaffoldAtom(id))
    expect(store.get(scaffoldStateAtom(id))).toEqual({
      inspectorOpen: false,
      panelCapacity: 3,
      hiddenPanelIds: [],
      hoveredPanelId: null,
    })

    // A removed id reads fresh atoms — state from before is gone.
    mountThree(store, id)
    store.set(measureScaffoldCanvasAtom(id), 700)
    removeScaffoldInstance(id)
    expect(store.get(scaffoldPanelCapacityAtom(id))).toBe(3)
    expect(store.get(scaffoldHiddenPanelIdsAtom(id))).toEqual([])
  })
})
