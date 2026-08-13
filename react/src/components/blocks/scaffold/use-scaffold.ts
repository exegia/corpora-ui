"use client"

import { useCallback, useMemo, useState } from "react"

import type { ScaffoldControls, UseScaffoldOptions } from "./type"

/**
 * Owns the scaffold's inspector state for UI living outside the scaffold
 * (title-bar buttons, command palette, shortcuts). Spread the returned
 * `providerProps` onto `Scaffold.Root`; without this hook the root manages
 * the same state internally via `defaultInspectorOpen`.
 */
export function useScaffold({
  defaultInspectorOpen,
  onInspectorChange,
}: UseScaffoldOptions = {}): ScaffoldControls {
  const [inspectorOpen, setOpenState] = useState(defaultInspectorOpen ?? false)

  const setInspectorOpen = useCallback(
    (open: boolean) => {
      setOpenState((prev) => {
        if (prev !== open) onInspectorChange?.(open)
        return open
      })
    },
    [onInspectorChange]
  )

  const toggleInspector = useCallback(
    () => setInspectorOpen(!inspectorOpen),
    [inspectorOpen, setInspectorOpen]
  )

  const providerProps = useMemo(
    () => ({
      inspectorOpen,
      onInspectorOpenChange: setInspectorOpen,
    }),
    [inspectorOpen, setInspectorOpen]
  )

  return {
    inspectorOpen,
    setInspectorOpen,
    toggleInspector,
    providerProps,
  }
}
