"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { SCAFFOLD_INSPECTOR_WIDTH } from "./constants"
import { ScaffoldContext } from "./scaffold-context"
import type { ScaffoldContextValue, ScaffoldRootProps } from "./type"
import { scaffoldBackgroundClass } from "./utils"

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

  const value = React.useMemo<ScaffoldContextValue>(
    () => ({ inspectorOpen, inspectorWidth, setInspectorOpen, toggleInspector }),
    [inspectorOpen, inspectorWidth, setInspectorOpen, toggleInspector]
  )

  return (
    <ScaffoldContext.Provider value={value}>
      <div
        className={cn(
          // `clip`, not `hidden`: the offcanvas inspector extends the
          // scrollable overflow, and focus/scrollIntoView would scroll a
          // hidden-overflow root sideways to reveal it.
          "relative isolate flex h-full w-full overflow-clip",
          scaffoldBackgroundClass,
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
