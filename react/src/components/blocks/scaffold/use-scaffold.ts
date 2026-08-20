"use client"

import { useEffect, useId, useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  removeScaffoldInstance,
  scaffoldInspectorOpenAtom,
  setScaffoldInspectorOpenAtom,
  toggleScaffoldInspectorAtom,
} from "./scaffold-atom"
import type { ScaffoldControls, UseScaffoldOptions } from "./type"

/**
 * Owns the scaffold's inspector state for UI living outside the scaffold
 * (title-bar buttons, command palette, shortcuts). Spread the returned
 * `providerProps` onto `Scaffold.Root`; without this hook the root manages
 * the same state internally via `defaultInspectorOpen`.
 *
 * The hook and the root meet in the store: `providerProps` carries a
 * `scaffoldId`, both sides read and write that instance's atoms, and
 * `useScaffoldState` / `useScaffoldActions` reach the same slice from
 * anywhere else by id. Unnamed scaffolds key off `useId` and are dropped on
 * unmount; an explicit `scaffoldId` outlives its component.
 */
export function useScaffold({
  scaffoldId: scaffoldIdProp,
  defaultInspectorOpen,
  onInspectorChange,
}: UseScaffoldOptions = {}): ScaffoldControls {
  const generatedId = useId()
  const scaffoldId = scaffoldIdProp ?? generatedId

  const inspectorOpen = useAtomValue(scaffoldInspectorOpenAtom(scaffoldId))
  const setInspectorOpen = useSetAtom(setScaffoldInspectorOpenAtom(scaffoldId))
  const toggleInspector = useSetAtom(toggleScaffoldInspectorAtom(scaffoldId))

  useEffect(() => {
    if (scaffoldIdProp !== undefined) return
    return () => removeScaffoldInstance(scaffoldId)
  }, [scaffoldIdProp, scaffoldId])

  const providerProps = useMemo<ScaffoldControls["providerProps"]>(
    () => ({
      scaffoldId,
      defaultInspectorOpen,
      onInspectorOpenChange: onInspectorChange,
    }),
    [scaffoldId, defaultInspectorOpen, onInspectorChange]
  )

  return {
    scaffoldId,
    inspectorOpen,
    setInspectorOpen,
    toggleInspector,
    providerProps,
  }
}
