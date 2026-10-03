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
export { AnchoredPopover } from "./anchored-popover"
export { useAnchoredPopover } from "./use-anchored-popover"
export { useAnchoredPopoverActions, useAnchoredPopoverState } from "./use-anchored-popover-state"
// The public atom surface — explicit on purpose, never `export *` from the atom module.
export {
  anchoredPopoverOpenAtom,
  anchoredPopoverPayloadAtom,
  anchoredPopoverRectAtom,
  anchoredPopoverStateAtom,
  anchoredPopoverTextAtom,
  hideAnchoredPopoverAtom,
  removeAnchoredPopoverInstance,
  showAnchoredPopoverAtom,
} from "./anchored-popover-atom"
