"use client"

import * as React from "react"
import { useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import { SCAFFOLD_INSPECTOR_WIDTH } from "./constants"
import {
  projectScaffoldPropsAtom,
  removeScaffoldInstance,
  seedScaffoldInspectorAtom,
  setScaffoldHandlersAtom,
} from "./scaffold-atom"
import { ScaffoldContext } from "./scaffold-context"
import type {
  ScaffoldConfig,
  ScaffoldContextValue,
  ScaffoldHandlers,
  ScaffoldRootProps,
} from "./type"
import type { ClassNameValue } from "tailwind-merge"

/**
 * The scaffold's viewport: desktop backdrop + horizontal row of rail and
 * main region, and the binding between this instance's props and its slice
 * of the store. Fills its container — size it from the outside (e.g.
 * `h-svh` for a full page).
 *
 * State lives in the store under `scaffoldId`; the context carries only the
 * id and the drawer width, so its value never changes while the scaffold is
 * mounted and parts subscribe to exactly the atoms they render from. A
 * controlled `inspectorOpen` stays the source of truth: it is projected
 * one-way into the store (so remote readers see current data), and the
 * inspector actions report through `onInspectorOpenChange` instead of
 * writing.
 */
export function ScaffoldRoot({
  scaffoldId: scaffoldIdProp,
  inspectorOpen: inspectorOpenProp,
  defaultInspectorOpen,
  onInspectorOpenChange,
  inspectorWidth = SCAFFOLD_INSPECTOR_WIDTH,
  className,
  children,
  ...rest
}: ScaffoldRootProps): React.ReactElement {
  const generatedId = React.useId()
  const scaffoldId = scaffoldIdProp ?? generatedId
  const background: ClassNameValue = `bg-linear-to-tr/increasing from-neutral-200 via-neutral-100 to-stone-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950`

  const controlsInspector = inspectorOpenProp !== undefined
  const config = React.useMemo<ScaffoldConfig>(
    () => ({ controlsInspector }),
    [controlsInspector]
  )
  const handlers = React.useMemo<ScaffoldHandlers>(
    () => ({ onInspectorOpenChange }),
    [onInspectorOpenChange]
  )

  const project = useSetAtom(projectScaffoldPropsAtom(scaffoldId))
  const publishHandlers = useSetAtom(setScaffoldHandlersAtom(scaffoldId))
  const seedInspector = useSetAtom(seedScaffoldInspectorAtom(scaffoldId))

  // Seed the uncontrolled inspector once per mount, before the projection —
  // `defaultInspectorOpen` describes the mount, not every render. Layout
  // effects so children read settled values in the same commit; primitive
  // deps, so no loop guard is needed.
  const [seed] = React.useState(
    () => inspectorOpenProp ?? defaultInspectorOpen ?? false
  )
  React.useLayoutEffect(() => {
    if (!controlsInspector) seedInspector(seed)
    // Mount-time seed only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Handlers before the projection — they must be in the store before any
  // action can fire.
  React.useLayoutEffect(() => {
    publishHandlers(handlers)
  }, [publishHandlers, handlers])
  React.useLayoutEffect(() => {
    project(config, inspectorOpenProp)
  }, [project, config, inspectorOpenProp])

  React.useEffect(() => {
    if (scaffoldIdProp !== undefined) return
    return () => removeScaffoldInstance(scaffoldId)
  }, [scaffoldIdProp, scaffoldId])

  const value = React.useMemo<ScaffoldContextValue>(
    () => ({ scaffoldId, inspectorWidth }),
    [scaffoldId, inspectorWidth]
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
