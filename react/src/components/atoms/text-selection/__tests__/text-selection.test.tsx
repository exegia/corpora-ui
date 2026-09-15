import { describe, expect, mock, test } from "bun:test"
import { Provider, createStore } from "jotai"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TextSelection } from "../selection"
import {
  initialSelectionState,
  selectionAtom,
  setSelectionAtom,
  setSelectionPopoverAtom,
} from "../selection-atom"
import { useSelection } from "../use-selection"

function SelectionHarness({
  onSelectionEnd,
}: {
  onSelectionEnd?: (selection: string) => void
}) {
  const selection = useSelection({ onSelectionEnd })
  return (
    <>
      <button
        onClick={() =>
          selection.selectionProps.onSelectionEnd("selected words")
        }
        type="button"
      >
        End selection
      </button>
      <button
        onClick={() => selection.selectionProps.onPopoverShow()}
        type="button"
      >
        Show popover
      </button>
      <output data-testid="selection-state">
        {selection.currentSelection} · {String(selection.showPopover)}
      </output>
    </>
  )
}

describe("text selection", () => {
  test("the atom exposes independent selection and popover updates", () => {
    const store = createStore()
    expect(store.get(selectionAtom)).toEqual(initialSelectionState)

    store.set(setSelectionAtom, "doctrinam")
    expect(store.get(selectionAtom)).toMatchObject({
      currentSelection: "doctrinam",
      selected: true,
      showPopover: false,
    })

    store.set(setSelectionPopoverAtom, true)
    expect(store.get(selectionAtom).showPopover).toBe(true)
  })

  test("useSelection turns highlight callbacks into shared state", async () => {
    const user = userEvent.setup()
    const store = createStore()
    const onSelectionEnd = mock(() => {})
    render(
      <Provider store={store}>
        <SelectionHarness onSelectionEnd={onSelectionEnd} />
      </Provider>
    )

    await user.click(screen.getByRole("button", { name: "End selection" }))
    expect(onSelectionEnd).toHaveBeenCalledWith("selected words")
    expect(screen.getByTestId("selection-state").textContent).toBe(
      "selected words · false"
    )

    await user.click(screen.getByRole("button", { name: "Show popover" }))
    expect(screen.getByTestId("selection-state").textContent).toBe(
      "selected words · true"
    )
  })

  test("TextSelection renders its selected children", () => {
    render(
      <TextSelection onSelectionEnd={() => {}} renderPopover={() => null}>
        <span>Selectable corpus text</span>
      </TextSelection>
    )

    expect(screen.getByText("Selectable corpus text")).toBeDefined()
  })
})
