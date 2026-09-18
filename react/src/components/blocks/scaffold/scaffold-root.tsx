"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import { SCAFFOLD_INSPECTOR_WIDTH } from "./constants"
import {
  projectScaffoldPropsAtom,
  scaffoldInspectorWidthAtom,
  removeScaffoldInstance,
  seedScaffoldInspectorAtom,
  setScaffoldHandlersAtom,
} from "./scaffold-atom"
import { ScaffoldContext } from "./scaffold-context"
import type {
  IScaffoldConfig,
  IScaffoldContextValue,
  IScaffoldHandlers,
  IScaffoldRootProps,
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
}: IScaffoldRootProps): React.ReactElement {
  const generatedId = React.useId()
  const scaffoldId = scaffoldIdProp ?? generatedId
  const background: ClassNameValue = `bg-linear-to-tr/increasing from-neutral-200 via-neutral-100 to-stone-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-stone-950`

  const controlsInspector = inspectorOpenProp !== undefined
  const config = React.useMemo<IScaffoldConfig>(
    () => ({ controlsInspector }),
    [controlsInspector]
  )
  const handlers = React.useMemo<IScaffoldHandlers>(
    () => ({ onInspectorOpenChange }),
    [onInspectorOpenChange]
  )

  const project = useSetAtom(projectScaffoldPropsAtom(scaffoldId))
  const publishHandlers = useSetAtom(setScaffoldHandlersAtom(scaffoldId))
  const seedInspector = useSetAtom(seedScaffoldInspectorAtom(scaffoldId))

  // Seed the uncontrolled inspector once per mount, before the projection —
  // `defaultInspectorOpen` describes the mount, not every render. Passive
  // effects on purpose: jotai (v3) subscribes readers in their own
  // `useEffect` with no post-subscription recheck, and the children's
  // subscription effects run before this parent's passive effects — a
  // `useLayoutEffect` write would land before any subscription exists and
  // the readers would never re-render with the seeded state.
  const [seed] = React.useState(
    () => inspectorOpenProp ?? defaultInspectorOpen ?? false
  )
  React.useEffect(() => {
    if (!controlsInspector) seedInspector(seed)
    // Mount-time seed only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Handlers before the projection — they must be in the store before any
  // action can fire.
  React.useEffect(() => {
    publishHandlers(handlers)
  }, [publishHandlers, handlers])
  React.useEffect(() => {
    project(config, inspectorOpenProp)
  }, [project, config, inspectorOpenProp])

  React.useEffect(() => {
    if (scaffoldIdProp !== undefined) return
    return () => removeScaffoldInstance(scaffoldId)
  }, [scaffoldIdProp, scaffoldId])

  const storedWidth = useAtomValue(scaffoldInspectorWidthAtom(scaffoldId))
  const value = React.useMemo<IScaffoldContextValue>(
    () => ({ scaffoldId, inspectorWidth: storedWidth ?? inspectorWidth }),
    [scaffoldId, inspectorWidth, storedWidth]
  )

  return (
    <ScaffoldContext.Provider value={value}>
      <div
        id={"scaffold-root"}
        className={cn(
          // `clip`, not `hidden`: the off canvas inspector extends the
          // scrollable overflow, and focus/scrollIntoView would scroll a
          // hidden-overflow root sideways to reveal it.
          "pr-2 pb-2 relative isolate flex size-full flex-1 overflow-clip",
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
