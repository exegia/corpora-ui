import { expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactElement, ReactNode } from "react"
import Breadcrumb from "@/components/composed/breadcrumb"
import { MenuCommand } from "@/components/ui/menu-command"
import { TooltipProvider } from "@/components/ui/tooltip"

function Trail({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <Breadcrumb.Root aria-label="Reading location">
        <Breadcrumb.List>{children}</Breadcrumb.List>
      </Breadcrumb.Root>
    </TooltipProvider>
  )
}

function ChapterContents() {
  return <a href="#chapter-2">Chapter two</a>
}

function SectionMenu({ children }: { children: ReactElement }) {
  return (
    <MenuCommand items={[{ id: "chapter", label: "Chapter two" }]}>
      {children}
    </MenuCommand>
  )
}

test("link and default variants preserve navigation and current-page semantics", async () => {
  const user = userEvent.setup()
  const click = mock()
  const { container } = render(
    <Trail>
      <Breadcrumb.Item
        variant="link"
        label="Library"
        href="#library"
        onClick={click}
      />
      <Breadcrumb.Separator />
      <Breadcrumb.Item
        variant="default"
        label="Current page"
        className="current-item"
      >
        <Breadcrumb.Page>Current page</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Trail>
  )

  expect(
    screen.getByRole("navigation", { name: "Reading location" })
  ).toBeTruthy()
  const link = screen.getByRole("link", { name: "Library" })
  expect(link.getAttribute("href")).toBe("#library")
  await user.click(link)
  expect(click).toHaveBeenCalledTimes(1)
  expect(screen.getByText("Current page").getAttribute("aria-current")).toBe(
    "page"
  )
  expect(
    screen
      .getByRole("button", { name: "Current page" })
      .hasAttribute("disabled")
  ).toBe(true)
  expect(
    container.querySelector(".current-item")?.getAttribute("data-slot")
  ).toBe("breadcrumb-item")
  expect(
    container.querySelector("[variant], [tooltip], [component]")
  ).toBeNull()
  expect(
    container.querySelector("a button, button a, button button")
  ).toBeNull()
})

test("default items render text children instead of their label", () => {
  render(
    <Trail>
      <Breadcrumb.Item variant="default" label="Fallback label">
        Visible content
      </Breadcrumb.Item>
    </Trail>
  )
  expect(
    screen
      .getByRole("button", { name: "Visible content" })
      .hasAttribute("disabled")
  ).toBe(true)
  expect(screen.queryByText("Fallback label")).toBeNull()
})

test("TOC opens preconfigured content by keyboard and restores focus on Escape", async () => {
  const user = userEvent.setup()
  const { container } = render(
    <Trail>
      <Breadcrumb.Item
        variant="toc"
        id="chapter-toc"
        label="Contents"
        Component={ChapterContents}
      />
    </Trail>
  )
  const trigger = screen.getByRole("button", { name: "Contents" })
  expect(trigger.id).toBe("chapter-toc")
  expect(screen.queryByText("Chapter two")).toBeNull()
  await user.tab()
  expect(document.activeElement).toBe(trigger)
  await user.keyboard("{Enter}")
  expect(await screen.findByRole("dialog", { name: "Contents" })).toBeTruthy()
  expect(
    screen.getByRole("link", { name: "Chapter two" }).getAttribute("href")
  ).toBe("#chapter-2")
  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(trigger))
  expect(container.querySelector("button button")).toBeNull()
})

test("menu items forward their trigger, run selection, and restore focus", async () => {
  const user = userEvent.setup()
  const select = mock()
  const click = mock()
  function ActionMenu({ children }: { children: ReactElement }) {
    return (
      <MenuCommand
        items={[{ id: "bookmark", label: "Bookmark", onSelect: select }]}
      >
        {children}
      </MenuCommand>
    )
  }
  const { container } = render(
    <Trail>
      <Breadcrumb.Item
        variant="menu"
        id="library-menu"
        label="Library"
        Component={ActionMenu}
        onClick={click}
      />
    </Trail>
  )
  const trigger = screen.getByRole("button", { name: "Library" })
  expect(trigger.id).toBe("library-menu")
  await user.tab()
  await user.keyboard("{Enter}")
  expect(click).toHaveBeenCalledTimes(1)
  await user.click(await screen.findByText("Bookmark"))
  expect(select).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(trigger))
  expect(container.querySelector("button button")).toBeNull()
})

test("custom tooltip content appears on link focus and dismisses with Escape", async () => {
  const user = userEvent.setup()
  render(
    <Trail>
      <Breadcrumb.Item
        variant="link"
        label="Library"
        href="#library"
        tooltip={<strong>Browse your collection</strong>}
      />
    </Trail>
  )
  await user.tab()
  expect((await screen.findByRole("tooltip")).textContent).toContain(
    "Browse your collection"
  )
  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull())
})

for (const tooltip of [undefined, null, false]) {
  test(`tooltip=${String(tooltip)} keeps the hint disabled`, async () => {
    const user = userEvent.setup()
    render(
      <Trail>
        <Breadcrumb.Item
          variant="link"
          label="Library"
          href="#library"
          tooltip={tooltip}
        />
      </Trail>
    )
    await user.tab()
    await user.hover(screen.getByRole("link", { name: "Library" }))
    expect(screen.queryByRole("tooltip")).toBeNull()
  })
}

test("separators support chevron, slash, and custom content with wrapper props", () => {
  const { container } = render(
    <Trail>
      <Breadcrumb.Separator id="chevron" />
      <Breadcrumb.Separator id="slash" symbol="slash" />
      <Breadcrumb.Separator
        id="custom"
        className="custom-separator"
        symbol="slash"
      >
        ·
      </Breadcrumb.Separator>
    </Trail>
  )
  expect(container.querySelector("#chevron > svg")).toBeTruthy()
  expect(container.querySelector("#slash")?.textContent).toBe("/")
  expect(container.querySelector("#custom")?.textContent).toBe("·")
  expect(
    container.querySelector("#custom")?.classList.contains("custom-separator")
  ).toBe(true)
  for (const separator of Array.from(
    container.querySelectorAll('[data-slot="breadcrumb-separator"]')
  )) {
    expect(separator.getAttribute("aria-hidden")).toBe("true")
    expect(separator.getAttribute("role")).toBe("presentation")
    expect(separator.hasAttribute("symbol")).toBe(false)
  }
  expect(screen.queryByRole("button")).toBeNull()
})

test("menu separators expose a labelled keyboard trigger and dismiss with Escape", async () => {
  const user = userEvent.setup()
  const { container } = render(
    <Trail>
      <Breadcrumb.Separator
        variant="menu"
        label="Choose a section"
        Component={SectionMenu}
        symbol="slash"
      >
        ·
      </Breadcrumb.Separator>
    </Trail>
  )
  const trigger = screen.getByRole("button", { name: "Choose a section" })
  expect(trigger.textContent).toContain("·")
  expect(trigger.closest("li")?.hasAttribute("aria-hidden")).toBe(false)
  expect(trigger.querySelector('[aria-hidden="true"]')).toBeTruthy()
  await user.tab()
  expect(document.activeElement).toBe(trigger)
  await user.keyboard("{Enter}")
  expect(await screen.findByText("Chapter two")).toBeTruthy()
  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(trigger))
  expect(container.querySelector("button button")).toBeNull()
})

test("disabled menu separators cannot open their menu", async () => {
  const user = userEvent.setup()
  render(
    <Trail>
      <Breadcrumb.Separator
        variant="menu"
        label="Choose a section"
        Component={SectionMenu}
        disabled
      />
      <Breadcrumb.Item variant="link" label="Library" href="#library" />
    </Trail>
  )
  const trigger = screen.getByRole("button", { name: "Choose a section" })
  expect(trigger.hasAttribute("disabled")).toBe(true)
  await user.click(trigger)
  expect(screen.queryByText("Chapter two")).toBeNull()
  await user.tab()
  expect(document.activeElement).toBe(
    screen.getByRole("link", { name: "Library" })
  )
})
