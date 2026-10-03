import { expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Compact } from "../compact"
import type { TTocItem } from "../type"

const child: TTocItem = {
  id: "sources",
  label: <strong>Sources</strong>,
  description: "Primary editions",
  link: "#sources-chapter",
  type: "chapter",
  level: 2,
}
const parent: TTocItem = {
  id: "intro",
  label: "Introduction",
  link: "#intro-section",
  type: "section",
  level: 1,
  nodes: [child],
}

test("compact TOC retains nested order, paths, links and tick depth", () => {
  render(<Compact items={[parent]} activeLink={child} />)
  const links = screen.getAllByRole("link")
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    parent.link,
    child.link,
  ])
  expect(links[1].getAttribute("aria-label")).toBe("Introduction › Sources")
  expect(links[1].getAttribute("aria-current")).toBe("page")
  expect((links[0].firstElementChild as HTMLElement).style.width).toBe("48px")
  expect((links[1].firstElementChild as HTMLElement).style.width).toBe("40px")
})

test("host navigation receives the original nested item without a native link", () => {
  const select = mock()
  render(<Compact items={[parent]} onLinkClick={select} />)
  expect(screen.queryByRole("link")).toBeNull()
  const button = screen.getByRole("button", { name: "Introduction › Sources" })
  fireEvent.click(button)
  expect(select).toHaveBeenCalledWith(child)
  expect(button.getAttribute("aria-current")).toBe("location")
})

test("controlled selection remains authoritative and follows prop changes", () => {
  const { rerender } = render(
    <Compact items={[parent]} activeLink={parent} onLinkClick={() => {}} />
  )
  const childButton = screen.getByRole("button", {
    name: "Introduction › Sources",
  })
  fireEvent.click(childButton)
  expect(childButton.hasAttribute("aria-current")).toBe(false)
  rerender(
    <Compact items={[parent]} activeLink={child} onLinkClick={() => {}} />
  )
  expect(childButton.getAttribute("aria-current")).toBe("location")
})

test("an empty outline has no selectable destinations", () => {
  render(<Compact items={[]} />)
  expect(
    screen.getByRole("navigation", { name: "Table of contents" })
  ).toBeDefined()
  expect(screen.queryByRole("link")).toBeNull()
  expect(screen.queryByRole("button")).toBeNull()
})

test("keyboard users can reach and activate a nested destination", async () => {
  const select = mock()
  const user = userEvent.setup()
  render(<Compact items={[parent]} onLinkClick={select} />)
  await user.tab()
  await user.tab()
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Introduction › Sources" })
  )
  await user.keyboard("{Enter}")
  expect(select).toHaveBeenCalledWith(child)
})
