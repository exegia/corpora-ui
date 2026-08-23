"use client"

import { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  resetScaffoldAtom,
  scaffoldStateAtom,
  setScaffoldInspectorOpenAtom,
  toggleScaffoldInspectorAtom,
  toggleScaffoldPanelAtom,
} from "./scaffold-atom"
import type {
  ScaffoldInstanceId,
  ScaffoldState,
  ScaffoldStateActions,
} from "./type"

/**
 * Read the scaffold registered under `scaffoldId` from anywhere below
 * `ExegiaProvider` — no controller, no props, no provider of its own.
 *
 * ```tsx
 * const { inspectorOpen, hiddenPanelIds } = useScaffoldState("workspace")
 * ```
 *
 * This returns the whole state object, so the caller re-renders on every
 * change, hovers included. A component that reads one field should subscribe
 * to that field's atom instead:
 * `useAtomValue(scaffoldInspectorOpenAtom("workspace"))`.
 */
export function useScaffoldState(scaffoldId: ScaffoldInstanceId): ScaffoldState {
  return useAtomValue(scaffoldStateAtom(scaffoldId))
}

/**
 * Drive the scaffold registered under `scaffoldId` from anywhere. Writes
 * only — the caller never re-renders when the scaffold changes, so this is
 * what a command palette or a keyboard shortcut should reach for.
 *
 * ```tsx
 * const scaffold = useScaffoldActions("workspace")
 * <Button onClick={scaffold.toggleInspector}>Inspect</Button>
 * ```
 */
export function useScaffoldActions(
  scaffoldId: ScaffoldInstanceId
): ScaffoldStateActions {
  const setInspectorOpen = useSetAtom(setScaffoldInspectorOpenAtom(scaffoldId))
  const toggleInspector = useSetAtom(toggleScaffoldInspectorAtom(scaffoldId))
  const togglePanel = useSetAtom(toggleScaffoldPanelAtom(scaffoldId))
  const reset = useSetAtom(resetScaffoldAtom(scaffoldId))

  return useMemo(
    () => ({ setInspectorOpen, toggleInspector, togglePanel, reset }),
    [setInspectorOpen, toggleInspector, togglePanel, reset]
  )
}
