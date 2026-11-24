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
export type {
  IAnchorRect,
  IAnchoredPopoverActions,
  IAnchoredPopoverContext,
  IAnchoredPopoverControlProps,
  IAnchoredPopoverProps,
  IAnchoredPopoverRenderProps,
  IAnchoredPopoverState,
  IShowAnchoredPopoverArgs,
  ITextPopoverRenderProps,
  IUseAnchoredPopoverOptions,
  IUseAnchoredPopoverResult,
  IVirtualAnchor,
  TAnchorInput,
  TAnchoredPopoverMatch,
  TAnchoredPopoverPopupProps,
  TAnchoredPopoverReason,
  TAnchoredPopoverTrigger,
} from "./type"
