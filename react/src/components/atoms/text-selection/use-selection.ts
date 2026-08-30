"use client"

import { useCallback, useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import {
  resetSelectionAtom,
  selectionAtom,
  setSelectionAtom,
  setSelectionPopoverAtom,
  setSelectionPositionAtom,
  updateSelectionAtom,
} from "./selection-atom"
import type { SelectionState, SelectionStateUpdate } from "./types"

export interface UseSelectionOptions {
  selected?: boolean
  onSelectionStart?: () => void
  onSelectionEnd?: (selection: string) => void
  onPopoverShow?: () => void
  onPopoverHide?: () => void
}

export interface UseSelectionResult {
  state: SelectionState
  selected: boolean
  currentSelection: string
  showPopover: boolean
  popoverPosition: SelectionState["popoverPosition"]
  setSelection: (selection: string) => void
  setPosition: (
    position: NonNullable<SelectionState["popoverPosition"]>
  ) => void
  setShowPopover: (show: boolean) => void
  update: (update: SelectionStateUpdate) => void
  reset: () => void
  selectionProps: {
    onSelectionStart: () => void
    onSelectionEnd: (selection: string) => void
    onPopoverShow: () => void
    onPopoverHide: () => void
  }
}

/**
 * Coordinates the third-party highlight popover callbacks with the shared
 * selection atom. The returned `selectionProps` can be spread directly onto
 * `@omsimos/react-highlight-popover`.
 */
export function useSelection(
  options: UseSelectionOptions = {}
): UseSelectionResult {
  const {
    selected: selectedProp,
    onSelectionStart: onSelectionStartProp,
    onSelectionEnd: onSelectionEndProp,
    onPopoverShow: onPopoverShowProp,
    onPopoverHide: onPopoverHideProp,
  } = options
  const state = useAtomValue(selectionAtom)
  const setSelection = useSetAtom(setSelectionAtom)
  const setPosition = useSetAtom(setSelectionPositionAtom)
  const setShowPopover = useSetAtom(setSelectionPopoverAtom)
  const update = useSetAtom(updateSelectionAtom)
  const reset = useSetAtom(resetSelectionAtom)

  const onSelectionStart = useCallback(() => {
    update({ selected: false, showPopover: false })
    onSelectionStartProp?.()
  }, [onSelectionStartProp, update])

  const onSelectionEnd = useCallback(
    (selection: string) => {
      setSelection(selection)
      onSelectionEndProp?.(selection)
    },
    [onSelectionEndProp, setSelection]
  )

  const onPopoverShow = useCallback(() => {
    setShowPopover(true)
    onPopoverShowProp?.()
  }, [onPopoverShowProp, setShowPopover])

  const onPopoverHide = useCallback(() => {
    setShowPopover(false)
    onPopoverHideProp?.()
  }, [onPopoverHideProp, setShowPopover])

  const selectionProps = useMemo(
    () => ({
      onSelectionStart,
      onSelectionEnd,
      onPopoverShow,
      onPopoverHide,
    }),
    [onPopoverHide, onPopoverShow, onSelectionEnd, onSelectionStart]
  )

  return {
    state:
      selectedProp === undefined ? state : { ...state, selected: selectedProp },
    selected: selectedProp ?? state.selected,
    currentSelection: state.currentSelection,
    showPopover: state.showPopover,
    popoverPosition: state.popoverPosition,
    setSelection,
    setPosition,
    setShowPopover,
    update,
    reset,
    selectionProps,
  }
}
