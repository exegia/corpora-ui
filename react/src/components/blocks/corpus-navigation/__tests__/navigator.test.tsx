import { afterEach, beforeEach, expect, test } from "bun:test"
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react"
import { createStore, Provider } from "jotai"
import { ExegiaProvider } from "@/lib/state"
import CorpusNavigator from "../corpus-navigator"
import { corpusNavigationStateAtom } from "@/components/composed/corpus-navigation"
import { bible } from "@/components/composed/corpus-navigation/__tests__/fixtures"
import { anchorFor } from "@/components/composed/corpus-navigation/utils"
const originalObserver = globalThis.ResizeObserver
const observers = new Set<ResizeObserverCallback>()
beforeEach(() => {
  globalThis.ResizeObserver = class {
    private callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }
    observe(target: Element) {
      if (target.hasAttribute("data-corpus-navigator"))
        observers.add(this.callback)
    }
    unobserve() {}
    disconnect() {
      observers.delete(this.callback)
    }
  } as unknown as typeof ResizeObserver
})
afterEach(() => {
  cleanup()
  observers.clear()
  globalThis.ResizeObserver = originalObserver
})
const resize = (width: number) =>
  act(() => {
    for (const observer of observers)
      observer(
        [{ contentRect: { width } }] as ResizeObserverEntry[],
        {} as ResizeObserver
      )
  })
test(
  "container breakpoints preserve draft across sheet, drawer and inline layout",
  async () => {
  const store = createStore()
  const data = bible()
  const view = render(
    <Provider store={store}>
      <CorpusNavigator
        navigatorId="responsive"
        data={data}
        defaultLocation={anchorFor(data, "john-1-1")}
      >
        Reading text
      </CorpusNavigator>
    </Provider>
  )
  const root = view.container.querySelector("[data-corpus-navigator]")!
  resize(390)
  expect(root.getAttribute("data-presentation")).toBe("compact")
  fireEvent.click(view.getByRole("button", { name: "Browse Sample Bible" }))
  await view.findByRole("dialog")
  fireEvent.click(await view.findByRole("button", { name: "Verse 3" }))
  expect(
    store.get(corpusNavigationStateAtom("responsive")).location?.nodeId
  ).toBe("john-1-1")
  resize(768)
  expect(root.getAttribute("data-presentation")).toBe("medium")
  expect(view.getAllByRole("dialog")).toHaveLength(1)
  resize(1440)
  expect(root.getAttribute("data-presentation")).toBe("wide")
  expect(store.get(corpusNavigationStateAtom("responsive")).draft?.nodeId).toBe(
    "john-1-3"
  )
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull())
  fireEvent.click(view.getByRole("button", { name: "Go to location" }))
  await waitFor(() =>
    expect(
      store.get(corpusNavigationStateAtom("responsive")).location?.nodeId
    ).toBe("john-1-3")
  )
  fireEvent.click(view.getByRole("button", { name: /Return to/ }))
  await waitFor(() =>
    expect(
      store.get(corpusNavigationStateAtom("responsive")).location?.nodeId
    ).toBe("john-1-1")
  )
  resize(320)
  expect(root.getAttribute("data-presentation")).toBe("compact")
  },
  15_000
)

test("provider portal inheritance, explicit override and deferred null container", async () => {
  const data = bible()
  const store = createStore()
  const host = document.createElement("div")
  const override = document.createElement("div")
  document.body.append(host, override)
  const content = (container?: HTMLElement | null) => (
    <ExegiaProvider store={store} portalContainer={host}>
      <CorpusNavigator
        navigatorId="portals"
        data={data}
        portalProps={{ container }}
      />
    </ExegiaProvider>
  )
  const view = render(content())
  try {
    fireEvent.click(view.getByRole("button", { name: "Browse Sample Bible" }))
    await waitFor(() =>
      expect(host.querySelector('[role="dialog"]')).toBeTruthy()
    )
    view.rerender(content(override))
    await waitFor(() =>
      expect(override.querySelector('[role="dialog"]')).toBeTruthy()
    )
    view.rerender(content(null))
    await waitFor(() =>
      expect(document.querySelector('[role="dialog"]')).toBeNull()
    )
    view.rerender(content(host))
    await waitFor(() =>
      expect(host.querySelector('[role="dialog"]')).toBeTruthy()
    )
  } finally {
    view.unmount()
    host.remove()
    override.remove()
  }
})
