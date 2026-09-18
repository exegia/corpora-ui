"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import {
  measureScaffoldCanvasAtom,
  registerScaffoldPanelIdsAtom,
  scaffoldHiddenPanelIdsAtom,
  scaffoldPanelLayoutsAtom,
  scaffoldActiveResizeAtom,
} from "./scaffold-atom"
import { useScaffoldContext } from "./scaffold-context"
import type { TScaffoldCanvasProps, IScaffoldPanelProps } from "./type"

/** A canvas child's panel id when it opted into responsive hiding. */
function panelIdOf(child: React.ReactNode): string | undefined {
  if (!React.isValidElement<Pick<IScaffoldPanelProps, "id">>(child))
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
}: TScaffoldCanvasProps): React.ReactElement {
  const { scaffoldId } = useScaffoldContext()
  const layouts = useAtomValue(scaffoldPanelLayoutsAtom(scaffoldId))
  const activeResize = useAtomValue(scaffoldActiveResizeAtom(scaffoldId))
  const hiddenPanelIds = useAtomValue(scaffoldHiddenPanelIdsAtom(scaffoldId))
  const registerPanelIds = useSetAtom(registerScaffoldPanelIdsAtom(scaffoldId))
  const measureCanvas = useSetAtom(measureScaffoldCanvasAtom(scaffoldId))
  const [width, setWidth] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      measureCanvas(entry.contentRect.width)
      setWidth(entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [measureCanvas])

  const childArray = React.Children.toArray(children)
  const panelIds = childArray
    .map(panelIdOf)
    .filter((id): id is string => id !== undefined)
  const idsKey = panelIds.join(" ")

  // Passive on purpose: jotai (v3) readers subscribe in their own
  // `useEffect`, so a layout-effect write at mount would land before any
  // subscription exists and never notify them.
  React.useEffect(() => {
    registerPanelIds(panelIds)
    // panelIds is rebuilt each render; idsKey carries its identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, registerPanelIds])

  const visibleChildren = childArray.filter((child) => {
    const id = panelIdOf(child)
    return id === undefined || !hiddenPanelIds.includes(id)
  })

  // With three columns, the center consumes the flexible space so Motion
  // Panels has at most one sized surface on either side.
  const fillChild =
    visibleChildren.length > 2
      ? visibleChildren[Math.floor(visibleChildren.length / 2)]
      : ([...visibleChildren]
          .reverse()
          .find((child) => panelIdOf(child) !== activeResize) ??
        visibleChildren.at(-1))
  const count = visibleChildren.length
  const equalWidth =
    width > 0 ? (width - Math.max(0, count - 1) * 8) / Math.max(1, count) : 320
  const sized = visibleChildren.filter((child) => child !== fillChild)
  const fillRequest =
    panelIdOf(fillChild) === activeResize
      ? (layouts[activeResize ?? ""]?.width ?? 320)
      : 320
  const fillReserve = Math.max(
    320,
    Math.min(fillRequest, width - Math.max(0, count - 1) * 328)
  )
  const availableExtra = Math.max(
    0,
    width - Math.max(0, count - 1) * 8 - (count - 1) * 320 - fillReserve
  )
  const requestedExtra = sized.reduce<number>(
    (sum, child) =>
      sum +
      Math.max(0, (layouts[panelIdOf(child) ?? ""]?.width ?? equalWidth) - 320),
    0
  )
  const resizingFill = panelIdOf(fillChild) === activeResize
  const ratio =
    requestedExtra > 0 && (resizingFill || requestedExtra > availableExtra)
      ? availableExtra / requestedExtra
      : 1
  const widths = new Map(
    sized.map((child) => [
      child,
      320 +
        (resizingFill && requestedExtra === 0
          ? availableExtra / Math.max(1, sized.length)
          : Math.max(
              0,
              (layouts[panelIdOf(child) ?? ""]?.width ?? equalWidth) - 320
            ) * ratio),
    ])
  )

  return (
    <div
      className={cn("min-h-0 gap-2 relative flex w-full flex-1", className)}
      data-slot="scaffold-canvas"
      data-motion-panels-fill=""
      ref={ref}
      {...rest}
    >
      {/* Keep folded panels mounted to preserve their content state. */}
      {childArray.map((child) => {
        if (!React.isValidElement(child)) return child
        const hidden = !visibleChildren.includes(child)
        return React.cloneElement(
          child as React.ReactElement<Record<string, unknown>>,
          {
            _panelHidden: hidden,
            _panelFill: child === fillChild,
            _panelEnd:
              childArray.indexOf(child) < childArray.indexOf(fillChild!),
            _panelMax: Math.max(
              320,
              width -
                Math.max(0, count - 1) * 8 -
                320 -
                sized
                  .filter((other) => other !== child)
                  .reduce<number>(
                    (sum, other) => sum + (widths.get(other) ?? 320),
                    0
                  )
            ),
            _panelWidth: widths.get(child) ?? equalWidth,
          }
        )
      })}
    </div>
  )
}
