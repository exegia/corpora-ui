import { expect, test } from "bun:test"
import { fireEvent, render, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createStore } from "jotai"
import { ExegiaProvider } from "@/lib/state"
import CorpusNavigator from "../corpus-navigator"
import {
  corpusNavigationStateAtom,
  corpusSchemas,
} from "@/components/composed/corpus-navigation"
import { bible } from "@/components/composed/corpus-navigation/__tests__/fixtures"
import { anchorFor } from "@/components/composed/corpus-navigation/utils"
import type { CorpusData } from "@/components/composed/corpus-navigation/types"

function setup(data = bible()) {
  const store = createStore()
  const view = render(
    <ExegiaProvider store={store}>
      <CorpusNavigator
        navigatorId="popover-reader"
        data={data}
        defaultLocation={anchorFor(
          data,
          data.schema.id === "bible" ? "john-1-1" : "page-1"
        )}
      >
        Reader text
      </CorpusNavigator>
    </ExegiaProvider>
  )
  return {
    ...view,
    store,
    state: () => store.get(corpusNavigationStateAtom("popover-reader")),
  }
}

test("Bible breadcrumb uses canonical tiles, preserves draft until Go, and supports Return", async () => {
  const user = userEvent.setup()
  const view = setup()
  await user.click(await view.findByRole("button", { name: "Browse Verse 1" }))
  const popup = await view.findByRole("dialog", { name: "Browse Verse 1" })
  await user.click(await within(popup).findByRole("radio", { name: "3" }))
  expect(view.state().draft?.nodeId).toBe("john-1-3")
  expect(view.state().location?.nodeId).toBe("john-1-1")
  expect(view.state().pickerOpen).toBe(false)
  await user.click(
    within(popup).getByRole("button", { name: "Go to location" })
  )
  await waitFor(() => expect(view.state().location?.nodeId).toBe("john-1-3"))
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull())
  await user.click(view.getByRole("button", { name: /Return to/ }))
  await waitFor(() => expect(view.state().location?.nodeId).toBe("john-1-1"))
})

test("cancelling the canonical popover restores the current anchor", async () => {
  const user = userEvent.setup()
  const view = setup()
  await user.click(
    await view.findByRole("button", { name: "Browse Book John" })
  )
  const popup = await view.findByRole("dialog")
  await user.click(await within(popup).findByRole("radio", { name: "John" }))
  expect(view.state().draft?.nodeId).toBe("john")
  await user.click(within(popup).getByRole("button", { name: "Cancel" }))
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull())
  expect(view.state().location?.nodeId).toBe("john-1-1")
  expect(view.state().draft?.nodeId).toBe("john-1-1")
})

test("regular document breadcrumb contains a searchable TOC tree", async () => {
  const data: CorpusData = {
    corpusId: "doc",
    editionId: "one",
    label: "Book",
    schema: corpusSchemas.library,
    nodes: [
      {
        id: "chapter",
        level: "chapter",
        label: "Reading",
        children: [
          { id: "page-1", level: "page", label: "First page" },
          { id: "page-2", level: "page", label: "Second page" },
        ],
      },
    ],
  }
  const user = userEvent.setup()
  const view = setup(data)
  await user.click(
    await view.findByRole("button", { name: "Browse Page First page" })
  )
  const popup = await view.findByRole("dialog")
  fireEvent.change(
    within(popup).getByRole("searchbox", { name: "Search table of contents" }),
    { target: { value: "Second" } }
  )
  await user.click(await within(popup).findByText("Second page"))
  expect(view.state().draft?.nodeId).toBe("page-2")
  await user.click(
    within(popup).getByRole("button", { name: "Go to location" })
  )
  await waitFor(() => expect(view.state().location?.nodeId).toBe("page-2"))
})

test("failed resolution keeps the breadcrumb popup available for retry", async () => {
  const data = {
    ...bible(),
    resolve: async () => {
      throw new Error("Unavailable")
    },
  }
  const user = userEvent.setup()
  const view = setup(data)
  await user.click(await view.findByRole("button", { name: "Browse Verse 1" }))
  const popup = await view.findByRole("dialog")
  await user.click(await within(popup).findByRole("radio", { name: "3" }))
  await user.click(
    within(popup).getByRole("button", { name: "Go to location" })
  )
  expect(await within(popup).findByRole("alert")).toBeTruthy()
  expect(view.state().location?.nodeId).toBe("john-1-1")
  expect(view.getByRole("dialog")).toBeTruthy()
})

test("breadcrumb popovers honor the navigator portal override", async () => {
  const host = document.createElement("div")
  document.body.append(host)
  const data = bible()
  const user = userEvent.setup()
  const view = render(
    <ExegiaProvider store={createStore()}>
      <CorpusNavigator
        data={data}
        defaultLocation={anchorFor(data, "john-1-1")}
        portalProps={{ container: host }}
      />
    </ExegiaProvider>
  )
  try {
    await user.click(
      await view.findByRole("button", { name: "Browse Verse 1" })
    )
    expect(await within(host).findByRole("dialog")).toBeTruthy()
  } finally {
    view.unmount()
    host.remove()
  }
})
