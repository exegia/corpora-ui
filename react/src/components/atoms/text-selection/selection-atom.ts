import { atom } from "jotai"
import type {
  SelectionPosition,
  SelectionState,
  SelectionStateUpdate,
} from "./types"

export const initialSelectionState: SelectionState = {
  selected: false,
  currentSelection: "",
  showPopover: false,
  popoverPosition: null,
}

export const selectionAtom = atom<SelectionState>(initialSelectionState)

/** Update only the fields that changed, keeping selection state atomic. */
export const updateSelectionAtom = atom(
  null,
  (get, set, update: SelectionStateUpdate) => {
    const next =
      typeof update === "function" ? update(get(selectionAtom)) : update
    set(selectionAtom, { ...get(selectionAtom), ...next })
  }
)

export const setSelectionAtom = atom(null, (_get, set, selection: string) => {
  set(updateSelectionAtom, { currentSelection: selection, selected: true })
})

export const setSelectionPositionAtom = atom(
  null,
  (_get, set, popoverPosition: SelectionPosition) => {
    set(updateSelectionAtom, { popoverPosition })
  }
)

export const setSelectionPopoverAtom = atom(
  null,
  (_get, set, showPopover: boolean) => {
    set(updateSelectionAtom, { showPopover })
  }
)

export const setCurrentSelectionAtom = setSelectionAtom
export const setPopoverPositionAtom = setSelectionPositionAtom
export const setShowPopoverAtom = setSelectionPopoverAtom

export const resetSelectionAtom = atom(null, (_get, set) => {
  set(selectionAtom, initialSelectionState)
})
