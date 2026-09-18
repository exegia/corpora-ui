"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import {
  attachSeparator,
  createPanel,
  createPanelGroup,
  type Orientation,
  type PanelController,
  type PanelOptions,
  type Size,
} from "motion-panels"

/** Attach Motion Panels to our existing surfaces without adding styled wrappers. */
export function useMotionPanel(
  options: PanelOptions<Size> & {
    orientation?: Orientation
    enabled?: boolean
  }
) {
  const {
    orientation = "horizontal",
    enabled = true,
    ...panelOptions
  } = options
  const panelRef = useRef<HTMLElement | null>(null)
  const gripRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<PanelController | null>(null)
  const latest = useRef(panelOptions)
  useLayoutEffect(() => {
    latest.current = panelOptions
  })

  useLayoutEffect(() => {
    const node = panelRef.current
    if (!node || !enabled) return
    const group = createPanelGroup(orientation)
    const controller = createPanel(group, latest.current)
    controllerRef.current = controller
    const detach = controller.attach(node)
    const extent = group.axes.extent
    const previous = node.style[extent]
    const draw = (size: number) => {
      node.style[extent] = `${Math.max(0, size)}px`
    }
    draw(controller.motion.size.get())
    const stopSize = controller.motion.size.on("change", draw)
    const stopState = controller.subscribe(() => {
      node.toggleAttribute("data-resizing", controller.state.dragging)
      node.toggleAttribute("data-folding", controller.state.folding)
    })
    const detachGrip = gripRef.current
      ? attachSeparator(gripRef.current, group, controller)
      : undefined
    return () => {
      detachGrip?.()
      stopSize()
      stopState()
      detach()
      controller.destroy()
      controllerRef.current = null
      node.style[extent] = previous
    }
  }, [orientation, enabled])

  useLayoutEffect(() => {
    controllerRef.current?.sync(panelOptions)
  })
  // A separator can mount after a collapsed panel becomes visible. The host
  // keeps it mounted instead and removes it from focus while closed.
  useEffect(
    () => () => {
      controllerRef.current?.drag.cancel()
    },
    []
  )
  return { panelRef, gripRef }
}
