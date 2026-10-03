import { describe, expect, test } from "bun:test"
import {
  closestMatch,
  isModifiedClick,
  rectToVirtualAnchor,
  selectionRangeWithin,
  toAnchorRect,
} from "../utils"

function view(html: string): HTMLDivElement {
  const el = document.createElement("div")
  el.innerHTML = html
  document.body.append(el)
  return el
}

describe("toAnchorRect", () => {
  test("a point becomes a zero-size rect", () => {
    expect(toAnchorRect({ x: 10, y: 20 })).toEqual({ x: 10, y: 20, width: 0, height: 0 })
  })
  test("a rect-like object is copied", () => {
    expect(toAnchorRect({ x: 1, y: 2, width: 3, height: 4 })).toEqual({ x: 1, y: 2, width: 3, height: 4 })
  })
  test("an element reads its bounding box", () => {
    const el = view("<b>x</b>").firstElementChild as HTMLElement
    el.getBoundingClientRect = () => ({ x: 5, y: 6, width: 7, height: 8 }) as DOMRect
    expect(toAnchorRect(el)).toEqual({ x: 5, y: 6, width: 7, height: 8 })
  })
})

describe("rectToVirtualAnchor", () => {
  test("serves the stored rect and carries the context element", () => {
    const ctx = view("")
    const anchor = rectToVirtualAnchor({ x: 1, y: 2, width: 3, height: 4 }, ctx)
    const rect = anchor.getBoundingClientRect()
    expect([rect.x, rect.y, rect.width, rect.height, rect.left, rect.top, rect.right, rect.bottom]).toEqual([
      1, 2, 3, 4, 1, 2, 4, 6,
    ])
    expect(anchor.contextElement).toBe(ctx)
  })
  test("prefers the live rect when one is supplied", () => {
    const anchor = rectToVirtualAnchor(
      { x: 1, y: 2, width: 3, height: 4 },
      null,
      () => ({ x: 9, y: 9, width: 1, height: 1 }) as DOMRect
    )
    expect(anchor.getBoundingClientRect().x).toBe(9)
  })
})

describe("closestMatch", () => {
  test("walks up to the first matching ancestor inside the view", () => {
    const root = view('<p data-term="a"><em id="inner">x</em></p><span id="plain">y</span>')
    expect(closestMatch(root.querySelector("#inner"), "[data-term]", root)?.getAttribute("data-term")).toBe("a")
    expect(closestMatch(root.querySelector("#plain"), "[data-term]", root)).toBeNull()
  })
  test("accepts a predicate", () => {
    const root = view('<p><b id="b">x</b></p>')
    expect(closestMatch(root.querySelector("#b"), (el) => el.tagName === "P", root)?.tagName).toBe("P")
  })
  test("without a matcher any element inside the view counts, including the view", () => {
    const root = view("<i>x</i>")
    expect(closestMatch(root.firstElementChild, undefined, root)).toBe(root.firstElementChild)
    expect(closestMatch(root, undefined, root)).toBe(root)
    expect(closestMatch(document.body, undefined, root)).toBeNull()
  })
  test("a text node resolves to its parent element", () => {
    const root = view("<i>x</i>")
    expect(closestMatch(root.firstElementChild!.firstChild, undefined, root)?.tagName).toBe("I")
  })
})

describe("selectionRangeWithin", () => {
  test("returns the range only when it lies inside the view and is not collapsed", () => {
    const root = view("<p>Selectable corpus text</p>")
    const other = view("<p>Elsewhere</p>")
    const text = root.firstElementChild!.firstChild as Text
    const range = document.createRange()
    range.setStart(text, 0)
    range.setEnd(text, 10)
    const sel = document.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
    expect(selectionRangeWithin(root)?.toString()).toBe("Selectable")
    expect(selectionRangeWithin(other)).toBeNull()
    range.collapse(true)
    expect(selectionRangeWithin(root)).toBeNull()
  })
})

describe("isModifiedClick", () => {
  test("flags non-primary buttons and modifier keys", () => {
    expect(isModifiedClick(new MouseEvent("click"))).toBe(false)
    expect(isModifiedClick(new MouseEvent("click", { button: 1 }))).toBe(true)
    expect(isModifiedClick(new MouseEvent("click", { metaKey: true }))).toBe(true)
    expect(isModifiedClick(new MouseEvent("click", { ctrlKey: true }))).toBe(true)
    expect(isModifiedClick(new MouseEvent("click", { shiftKey: true }))).toBe(true)
  })
})
