export { HighlightPopover, TextSelection } from "./text-selection"
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
} from "./text-selection/selection-atom"
export { useSelection } from "./text-selection/use-selection"
export type {
  HighlightPopoverPrimitiveProps,
  HighlightPopoverProps,
  SelectionPosition,
  SelectionPopoverComponent,
  SelectionRenderProps,
  SelectionState,
  SelectionStateUpdate,
  TextSelectionProps,
} from "./text-selection/types"
export type {
  UseSelectionOptions,
  UseSelectionResult,
} from "./text-selection/use-selection"
