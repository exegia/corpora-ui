import { afterEach, expect, test } from "bun:test"
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createStore, Provider } from "jotai"
import ReferenceCommand from "../reference-command"
import {
  bindCorpusNavigationAtom,
  corpusNavigationStateAtom,
  setCorpusCommandOpenAtom,
} from "../corpus-navigation-atom"
import { bible } from "./fixtures"
import { anchorFor } from "../utils"
afterEach(cleanup)
function setup() {
  const store = createStore()
  const data = bible()
  for (const id of ["one", "two"])
    store.set(bindCorpusNavigationAtom(id), {
      data,
      controlled: false,
      location: anchorFor(data, "john-1-1"),
      historyLimit: 20,
    })
  return store
}
test("one shortcut owner opens; unrelated input and composition are ignored", async () => {
  const store = setup()
  const view = render(
    <Provider store={store}>
      <ReferenceCommand navigatorId="one" shortcut="global" />
      <ReferenceCommand navigatorId="two" shortcut="global" />
      <input aria-label="Unrelated" />
    </Provider>
  )
  fireEvent.keyDown(view.getByLabelText("Unrelated"), {
    key: "k",
    ctrlKey: true,
  })
  expect(store.get(corpusNavigationStateAtom("one")).commandOpen).toBe(false)
  fireEvent.keyDown(document.body, {
    key: "k",
    ctrlKey: true,
    isComposing: true,
  })
  expect(store.get(corpusNavigationStateAtom("one")).commandOpen).toBe(false)
  fireEvent.keyDown(document.body, { key: "k", ctrlKey: true })
  await waitFor(() => expect(view.getAllByRole("dialog")).toHaveLength(1))
  expect(store.get(corpusNavigationStateAtom("one")).commandOpen).toBe(true)
  expect(store.get(corpusNavigationStateAtom("two")).commandOpen).toBe(false)
})
test("reference Enter commits once and Escape restores the trigger", async () => {
  const store = setup()
  const user = userEvent.setup()
  const view = render(
    <Provider store={store}>
      <ReferenceCommand navigatorId="one" />
    </Provider>
  )
  const trigger = view.getByRole("button", { name: /Find a reference/ })
  await user.click(trigger)
  const input = await view.findByRole("combobox", { name: "Reference or text" })
  await user.type(input, "Jn 1:5")
  await view.findByRole("option", { name: "John › 1 › 5" })
  await user.keyboard("{ArrowDown}{Enter}")
  await waitFor(() =>
    expect(store.get(corpusNavigationStateAtom("one")).location?.nodeId).toBe(
      "john-1-5"
    )
  )
  expect(store.get(corpusNavigationStateAtom("one")).history).toHaveLength(1)
  await act(async () => {
    store.set(setCorpusCommandOpenAtom("one"), true)
  })
  await waitFor(() => expect(view.getByRole("dialog")).toBeTruthy())
  await user.keyboard("{Escape}")
  await waitFor(() =>
    expect(store.get(corpusNavigationStateAtom("one")).commandOpen).toBe(false)
  )
  await waitFor(() => expect(document.activeElement).toBe(trigger))
})

test("async reference activation completes before closing", async () => {
  const store = createStore()
  const data = bible()
  const user = userEvent.setup()
  let complete!: (anchor: import("../types").CorpusAnchor) => void
  data.resolve = () =>
    new Promise((resolve) => {
      complete = resolve
    })
  store.set(bindCorpusNavigationAtom("async"), {
    data,
    controlled: false,
    location: anchorFor(data, "john-1-1"),
    historyLimit: 20,
  })
  const view = render(
    <Provider store={store}>
      <ReferenceCommand navigatorId="async" />
    </Provider>
  )
  await user.click(view.getByRole("button", { name: /Find a reference/ }))
  await user.type(
    await view.findByRole("combobox", { name: "Reference or text" }),
    "Jn 1:5"
  )
  await user.click(await view.findByRole("option", { name: "John › 1 › 5" }))
  expect(store.get(corpusNavigationStateAtom("async")).pending).toBe(true)
  await act(async () => {
    complete(anchorFor(data, "john-1-5"))
  })
  expect(store.get(corpusNavigationStateAtom("async")).location?.nodeId).toBe(
    "john-1-5"
  )
})
