/**
 * Per-instance state for `useAnchoredPopover`, keyed by popover id.
 *
 * Only plain data lives here (`open`, `text`, a rect snapshot, the payload) so
 * any component can read the current selection or close a popover by id. The
 * matched DOM element and the live anchor stay inside the hook.
 */
import { atom } from "jotai"
import { createKeyedFamilies } from "@/lib/keyed-atom"
import type { IAnchorRect, IAnchoredPopoverState, IShowAnchoredPopoverArgs } from "./type"

const { keyed, stateFamily, actionFamily, removeInstance } = createKeyedFamilies("anchoredPopover")

export const anchoredPopoverOpenAtom = stateFamily<boolean>("open", false)
export const anchoredPopoverTextAtom = stateFamily<string>("text", "")
export const anchoredPopoverRectAtom = stateFamily<IAnchorRect | null>("rect", null)
export const anchoredPopoverPayloadAtom = stateFamily<unknown>("payload", undefined)

export const anchoredPopoverStateAtom = keyed((id) => {
  const instance = atom<IAnchoredPopoverState>((get) => ({
    open: get(anchoredPopoverOpenAtom(id)),
    text: get(anchoredPopoverTextAtom(id)),
    rect: get(anchoredPopoverRectAtom(id)),
    payload: get(anchoredPopoverPayloadAtom(id)),
  }))
  instance.debugLabel = `anchoredPopover/${id}/state`
  return instance
})

export const showAnchoredPopoverAtom = actionFamily<[args: IShowAnchoredPopoverArgs]>(
  "show",
  (_get, set, id, { rect, text, payload }) => {
    set(anchoredPopoverRectAtom(id), rect)
    set(anchoredPopoverTextAtom(id), text)
    set(anchoredPopoverPayloadAtom(id), payload)
    set(anchoredPopoverOpenAtom(id), true)
  }
)

/** Closes only. Text and rect stay so remote readers keep the last selection and the exit animation keeps its anchor. */
export const hideAnchoredPopoverAtom = actionFamily<[]>("hide", (_get, set, id) => {
  set(anchoredPopoverOpenAtom(id), false)
})

export const removeAnchoredPopoverInstance = removeInstance
