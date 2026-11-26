"use client"

import { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import {
  anchoredPopoverStateAtom,
  hideAnchoredPopoverAtom,
  showAnchoredPopoverAtom,
} from "./anchored-popover-atom"
import type { IAnchoredPopoverActions, IAnchoredPopoverState } from "./type"

/** Read a popover's state from anywhere under the provider. */
export function useAnchoredPopoverState(id: string): IAnchoredPopoverState {
  return useAtomValue(anchoredPopoverStateAtom(id))
}

/** Write-only handle — the caller never re-renders when the popover changes. */
export function useAnchoredPopoverActions(id: string): IAnchoredPopoverActions {
  const show = useSetAtom(showAnchoredPopoverAtom(id))
  const hide = useSetAtom(hideAnchoredPopoverAtom(id))
  return useMemo(() => ({ show, hide }), [show, hide])
}
