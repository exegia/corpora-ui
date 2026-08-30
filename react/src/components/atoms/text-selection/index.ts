export { HighlightPopover } from "./popover"
export { TextSelection } from "./selection"
export {
  initialSelectionState,
  resetSelectionAtom,
  selectionAtom,
  setCurrentSelectionAtom,
  setPopoverPositionAtom,
  setSelectionAtom,
  setSelectionPopoverAtom,
  setSelectionPositionAtom,
  setShowPopoverAtom,
  updateSelectionAtom,
} from "./selection-atom"
export { useSelection } from "./use-selection"
export type {
  HighlightPopoverPrimitiveProps,
  HighlightPopoverProps,
  SelectionPosition,
  SelectionPopoverComponent,
  SelectionRenderProps,
  SelectionState,
  SelectionStateUpdate,
  TextSelectionProps,
} from "./types"
export type { UseSelectionOptions, UseSelectionResult } from "./use-selection"
