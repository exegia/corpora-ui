"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_INSPECTOR_WIDTH } from "./constants"
import { ScaffoldContext } from "./scaffold-context"
import { usePanelVisibility } from "./use-panel-visibility"
import type { ScaffoldContextValue, ScaffoldRootProps } from "./type"
import type { ClassNameValue } from "tailwind-merge"

/**
 * The scaffold's viewport: desktop backdrop + horizontal row of rail and
 * main region, and the provider for the shared inspector state. Fills its
 * container — size it from the outside (e.g. `h-svh` for a full page).
 */
export function ScaffoldRoot({
  inspectorOpen: inspectorOpenProp,
  defaultInspectorOpen,
  onInspectorOpenChange,
  inspectorWidth = SCAFFOLD_INSPECTOR_WIDTH,
  className,
  children,
  ...rest
}: ScaffoldRootProps): React.ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultInspectorOpen ?? false
  )
  const inspectorOpen = inspectorOpenProp ?? uncontrolledOpen
  const background: ClassNameValue = `bg-linear-to-tr/increasing from-neutral-200 via-neutral-100 to-stone-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950`

  const setInspectorOpen = React.useCallback(
    (open: boolean) => {
      if (inspectorOpenProp === undefined) setUncontrolledOpen(open)
      onInspectorOpenChange?.(open)
    },
    [inspectorOpenProp, onInspectorOpenChange]
  )

  const toggleInspector = React.useCallback(
    () => setInspectorOpen(!inspectorOpen),
    [inspectorOpen, setInspectorOpen]
  )

  const panelVisibility = usePanelVisibility()

  const value = React.useMemo<ScaffoldContextValue>(
    () => ({
      inspectorOpen,
      inspectorWidth,
      setInspectorOpen,
      toggleInspector,
      ...panelVisibility,
    }),
    [
      inspectorOpen,
      inspectorWidth,
      setInspectorOpen,
      toggleInspector,
      panelVisibility,
    ]
  )

  return (
    <ScaffoldContext.Provider value={value}>
      <div
        id={"scaffold-root"}
        className={cn(
          // `clip`, not `hidden`: the off canvas inspector extends the
          // scrollable overflow, and focus/scrollIntoView would scroll a
          // hidden-overflow root sideways to reveal it.
          "relative isolate flex size-full flex-1 overflow-clip pr-2 pb-2",
          background,
          className
        )}
        data-slot="scaffold"
        {...rest}
      >
        {children}
      </div>
    </ScaffoldContext.Provider>
  )
}
