"use client"

import { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  resetShellPanelWidthAtom,
  resizeShellPanelAtom,
  shellFitStateAtom,
} from "./shell-fit-atom"
import type { ShellFitActions, ShellFitInstanceId, ShellFitState } from "./type"

/**
 * Read the fit of the shell registered under `shellId` from anywhere below
 * `ExegiaProvider` — no controller, no props, no provider of its own.
 *
 * ```tsx
 * const { fits, panelWidth } = useShellFitState("app-shell")
 * ```
 *
 * This returns the whole state object, so the caller re-renders on every
 * measurement. A component that reads one field should subscribe to that
 * field's atom instead: `useAtomValue(shellFitFitsAtom("app-shell"))`.
 */
export function useShellFitState(shellId: ShellFitInstanceId): ShellFitState {
  return useAtomValue(shellFitStateAtom(shellId))
}

/**
 * Drive the secondary panel of the shell registered under `shellId` from
 * anywhere. Writes only — the caller never re-renders when the shell moves,
 * so this is what a command palette or a keyboard shortcut should reach for.
 *
 * ```tsx
 * const shell = useShellFitActions("app-shell")
 * <Button onClick={() => shell.resizePanel(480)}>Wide inspector</Button>
 * ```
 */
export function useShellFitActions(
  shellId: ShellFitInstanceId
): ShellFitActions {
  const resizePanel = useSetAtom(resizeShellPanelAtom(shellId))
  const resetPanelWidth = useSetAtom(resetShellPanelWidthAtom(shellId))

  return useMemo(
    () => ({ resizePanel, resetPanelWidth }),
    [resizePanel, resetPanelWidth]
  )
}
