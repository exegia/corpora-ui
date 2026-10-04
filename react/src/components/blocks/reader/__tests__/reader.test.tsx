import { expect, test } from "bun:test"
import { render } from "@testing-library/react"
import { Reader } from "../index"
import { railItemSize } from "../utils"
import type { TCanonItem } from "@/components/composed/navigation/toc/type"

test("rail only appears when TOC is collapsed and verses are ready", () => {
  const verses: TCanonItem[] = [
    {
      id: "verse",
      label: "Verse 1",
      number: 1,
      type: "verse",
      level: 4,
      link: "#reader-verse",
    },
  ]
  const props = { verses, onVerseSelect: () => {} }
  const view = render(<Reader {...props}>Text</Reader>)
  expect(
    view.container.querySelector("[data-slot=reader-verse-rail]")
  ).toBeNull()
  view.rerender(
    <Reader {...props} tocCollapsed>
      Text
    </Reader>
  )
  expect(
    view.container.querySelector("[data-slot=reader-verse-rail]")
  ).toBeTruthy()
  view.rerender(
    <Reader {...props} tocCollapsed loading>
      Text
    </Reader>
  )
  expect(
    view.container.querySelector("[data-slot=reader-verse-rail]")
  ).toBeNull()
  view.rerender(
    <Reader {...props} tocCollapsed verses={[]}>
      Text
    </Reader>
  )
  expect(
    view.container.querySelector("[data-slot=reader-verse-rail]")
  ).toBeNull()
})

test("tick spacing stays compact and fits long chapters", () => {
  expect(railItemSize(600, 31)).toBe(12)
  expect(railItemSize(600, 176)).toBeCloseTo(600 / 176)
  expect(railItemSize(600, 0)).toBe(12)
})
