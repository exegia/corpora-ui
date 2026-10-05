import { describe, expect, test } from "bun:test"
import { createStore } from "jotai"
import {
  anchoredPopoverStateAtom,
  hideAnchoredPopoverAtom,
  removeAnchoredPopoverInstance,
  showAnchoredPopoverAtom,
} from "../anchored-popover-atom"

const rect = { x: 1, y: 2, width: 3, height: 4 }

describe("anchored popover atoms", () => {
  test("show opens one instance with its rect, text and payload", () => {
    const store = createStore()
    store.set(showAnchoredPopoverAtom("a"), { rect, text: "lemma", payload: { id: 7 } })
    expect(store.get(anchoredPopoverStateAtom("a"))).toEqual({
      open: true,
      text: "lemma",
      rect,
      payload: { id: 7 },
    })
    expect(store.get(anchoredPopoverStateAtom("b"))).toEqual({
      open: false,
      text: "",
      rect: null,
      payload: undefined,
    })
  })

  test("hide closes but keeps the last text and rect readable", () => {
    const store = createStore()
    store.set(showAnchoredPopoverAtom("a"), { rect, text: "lemma" })
    store.set(hideAnchoredPopoverAtom("a"))
    expect(store.get(anchoredPopoverStateAtom("a"))).toEqual({
      open: false,
      text: "lemma",
      rect,
      payload: undefined,
    })
  })

  test("removeAnchoredPopoverInstance forgets the instance", () => {
    const store = createStore()
    store.set(showAnchoredPopoverAtom("gone"), { rect, text: "x" })
    removeAnchoredPopoverInstance("gone")
    expect(store.get(anchoredPopoverStateAtom("gone")).open).toBe(false)
  })

  test("every atom carries a debug label", () => {
    expect(anchoredPopoverStateAtom("dbg").debugLabel).toBe("anchoredPopover/dbg/state")
    expect(showAnchoredPopoverAtom("dbg").debugLabel).toBe("anchoredPopover/dbg/show")
  })
})
