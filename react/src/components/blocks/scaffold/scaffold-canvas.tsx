"use client"

import { AnimatePresence } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useScaffoldContext } from "./scaffold-context"
import type { ScaffoldCanvasProps, ScaffoldPanelProps } from "./type"

/** A canvas child's panel id when it opted into responsive hiding. */
function panelIdOf(child: React.ReactNode): string | undefined {
  if (!React.isValidElement<Pick<ScaffoldPanelProps, "id">>(child))
    return undefined
  const id = child.props.id
  return typeof id === "string" ? id : undefined
}

/**
 * The panel row below the action cluster: 8px gutters, 8px gaps, panels
 * side by side. Key each `Scaffold.Panel` child so closes animate out.
 * Measures its own width and hides id'd panels (oldest activation first)
 * whenever it can't grant each one `SCAFFOLD_PANEL_MIN_WIDTH`.
 */
export function ScaffoldCanvas({
  className,
  children,
  ...rest
}: ScaffoldCanvasProps): React.ReactElement {
  const { hiddenPanelIds, registerPanelIds, setCanvasWidth } =
    useScaffoldContext()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) =>
      setCanvasWidth(entry.contentRect.width)
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [setCanvasWidth])

  const childArray = React.Children.toArray(children)
  const panelIds = childArray
    .map(panelIdOf)
    .filter((id): id is string => id !== undefined)
  const idsKey = panelIds.join(" ")

  React.useLayoutEffect(() => {
    registerPanelIds(panelIds)
    // panelIds is rebuilt each render; idsKey carries its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, registerPanelIds])

  const visibleChildren = childArray.filter((child) => {
    const id = panelIdOf(child)
    return id === undefined || !hiddenPanelIds.includes(id)
  })

  return (
    <div
      className={cn("relative flex min-h-0 w-full flex-1 gap-2", className)}
      data-slot="scaffold-canvas"
      ref={ref}
      {...rest}
    >
      {/* Sync mode (no `mode="wait"`): an exiting panel shrinks in place
          while its siblings grow into the freed room in the same beat. */}
      <AnimatePresence initial={false}>{visibleChildren}</AnimatePresence>
    </div>
  )
}
