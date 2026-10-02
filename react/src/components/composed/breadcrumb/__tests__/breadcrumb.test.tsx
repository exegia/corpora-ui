import { expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  type BreadcrumbItemOverlay,
} from "@/ui/breadcrumb"
import { MenuItem } from "@/components/ui/menu"
import { TooltipProvider } from "@/components/ui/tooltip"

function Example({ overlay }: { overlay?: BreadcrumbItemOverlay }) {
  return (
    <TooltipProvider delay={0}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem overlay={overlay}>
            <BreadcrumbLink href="#library">Library</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Current page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </TooltipProvider>
  )
}

test("plain breadcrumbs preserve links and current-page semantics", () => {
  const { container } = render(<Example />)
  expect(
    screen.getByRole("link", { name: "Library" }).getAttribute("href")
  ).toBe("#library")
  expect(screen.getByText("Current page").getAttribute("aria-current")).toBe(
    "page"
  )
  expect(screen.queryByRole("button")).toBeNull()
  expect(container.querySelectorAll("ol > li").length).toBe(2)
})

test("menu opens by keyboard, runs actions, and restores trigger focus", async () => {
  const user = userEvent.setup()
  const select = mock()
  const { container } = render(
    <Example
      overlay={{
        type: "menu",
        label: "Library actions",
        content: <MenuItem onClick={select}>Bookmark</MenuItem>,
      }}
    />
  )
  await user.tab()
  expect(document.activeElement).toBe(
    screen.getByRole("link", { name: "Library" })
  )
  await user.tab()
  const trigger = screen.getByRole("button", { name: "Library actions" })
  expect(document.activeElement).toBe(trigger)
  await user.keyboard("{ArrowDown}")
  const action = await screen.findByRole("menuitem", { name: "Bookmark" })
  await waitFor(() => expect(document.activeElement).toBe(action))
  await user.keyboard("{Enter}")
  expect(select).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(document.activeElement).toBe(trigger))
  expect(
    container.querySelector("a button, button a, button button")
  ).toBeNull()
})

test("popover on the current page opens and dismisses with Escape", async () => {
  const user = userEvent.setup()
  render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem
          overlay={{
            type: "popover",
            label: "Page details",
            content: <p>Updated today</p>,
          }}
        >
          <BreadcrumbPage>Current page</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
  const trigger = screen.getByRole("button", { name: "Page details" })
  await user.click(trigger)
  expect(
    await screen.findByRole("dialog", { name: "Page details" })
  ).toBeTruthy()
  expect(screen.getByText("Current page").getAttribute("aria-current")).toBe(
    "page"
  )
  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(document.activeElement).toBe(trigger)
})

test("tooltip is available on keyboard focus and dismisses with Escape", async () => {
  const user = userEvent.setup()
  render(
    <Example
      overlay={{
        type: "tooltip",
        label: "Library help",
        content: "Browse your collection",
      }}
    />
  )
  await user.tab()
  await user.tab()
  expect(await screen.findByRole("tooltip")).toBeTruthy()
  expect(screen.getByText("Browse your collection")).toBeTruthy()
  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull())
})

for (const type of ["menu", "popover", "tooltip"] as const) {
  test(`disabled ${type} keeps its link available without opening`, async () => {
    const user = userEvent.setup()
    render(
      <Example
        overlay={{
          type,
          label: "Unavailable",
          content: "Content",
          disabled: true,
        }}
      />
    )
    const trigger = screen.getByRole("button", { name: "Unavailable" })
    expect(trigger.hasAttribute("disabled")).toBe(true)
    await user.click(trigger)
    expect(screen.queryByText("Content")).toBeNull()
    expect(screen.getByRole("link", { name: "Library" })).toBeTruthy()
  })
}
