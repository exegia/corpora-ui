import { expect, mock, test } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { CanonGrid } from "../canon-grid"
import type { TCanonItem } from "../types"

test("standalone grid reports original items and back actions without a canonical store", async () => {
  const verse: TCanonItem = { id: "verse", label: "Exodus 2:3", number: 3,
    type: "verse", level: 4, link: "#exod-2-3-verse" }
  const select = mock()
  const back = mock()
  const view = render(<CanonGrid title="Verses" items={[verse]} onLinkClick={select} onBack={back} backLabel="Chapters" />)
  await act(async () => { fireEvent.click(screen.getByRole("radio", { name: "3" })) })
  expect(select).toHaveBeenCalledWith(verse)
  view.rerender(<CanonGrid title="Verses" items={[verse]} selectedLink={verse.link} onBack={back} backLabel="Chapters" />)
  expect(screen.getByRole("radio", { name: "3" }).getAttribute("aria-checked")).toBe("true")
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Chapters" })) })
  expect(back).toHaveBeenCalledTimes(1)
})
