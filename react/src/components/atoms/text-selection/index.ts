export { TextClickPopover } from "./click-popover"
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
  THighlightPopoverPrimitiveProps,
  IHighlightPopoverProps,
  ISelectionPosition,
  TSelectionPopoverComponent,
  ISelectionRenderProps,
  ISelectionState,
  TSelectionStateUpdate,
  ITextClickPopoverProps,
  ITextPopoverRenderProps,
  ITextSelectionProps,
  IUseSelectionOptions,
  IUseSelectionResult,
} from "./types"
