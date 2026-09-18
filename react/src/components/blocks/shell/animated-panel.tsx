"use client"
// beui.dev/components/motion/animated-sidebar

import { motion } from "motion/react"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { useSetAtom } from "jotai"
import { shellPanelAtoms } from "./shell-panel-atom"
import { useMotionPanel } from "@/lib/use-motion-panel"
import type { IAnimatedSidebarProps } from "./type"
import {
  AnimatedSidebarPanelContext,
  useAnimatedSidebar,
  SIDEBAR_MORPH_TRANSITION,
  PANEL_TRANSITION,
  REDUCED_TRANSITION,
} from "./utils"

export function AnimatedPanel({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  ariaLabel = "Sidebar",
  children,
  className,
  panelClassName,
  style,
  ref,
  ...props
}: IAnimatedSidebarProps) {
  const context = useAnimatedSidebar()
  const resizeSidebar = useSetAtom(
    shellPanelAtoms(context.fit.shellId).resizeSidebar
  )
  const { bounds, panelWidth, resizePanel } = context.fit
  const sidebar = context.fit.sidebar
  const sideOpen = context.open[side]
  const collapsed =
    side === "left" && sidebar
      ? sidebar.mode !== "expanded"
      : collapsible !== "none" && !sideOpen
  const offcanvas =
    side === "left" && sidebar
      ? sidebar.mode === "hidden"
      : collapsed && collapsible === "offcanvas"
  const visible = side !== "right" || context.fit.fits
  const width =
    side === "right"
      ? (panelWidth ?? 320)
      : (sidebar?.width ?? (collapsed ? 56 : 256))
  const { panelRef, gripRef } = useMotionPanel({
    size: width,
    defaultSize:
      side === "right"
        ? (context.fit.defaultPanelWidth ?? (bounds.min || 320))
        : 256,
    minSize:
      side === "right"
        ? bounds.min || 320
        : collapsed
          ? width
          : (sidebar?.minWidth ?? 180),
    maxSize:
      side === "right"
        ? bounds.max || 640
        : collapsed
          ? width
          : (sidebar?.maxWidth ?? 480),
    collapsed: offcanvas,
    enabled: visible,
    overshoot: false,
    transition: context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION,
    onSizeChange: (size) =>
      side === "right"
        ? resizePanel(Number(size))
        : resizeSidebar(Number(size)),
    onCollapsedChange:
      collapsible !== "none"
        ? (value) => context.setOpen(!value, side)
        : undefined,
  })
  const setPanelRef = useCallback(
    (node: HTMLElement | null) => {
      panelRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [panelRef, ref]
  )

  // A secondary panel exists only while the viewport can carry it beside the
  // rail and the body at their own floors. Below that there is nothing to dock
  // into, so the panel stands down rather than squeezing the content column —
  // and its trigger stands down with it.
  if (side === "right" && !context.fit.fits) return null

  return (
    <motion.aside
      {...props}
      ref={setPanelRef}
      initial={false}
      aria-label={ariaLabel}
      aria-hidden={offcanvas || undefined}
      inert={offcanvas || undefined}
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      animate={{
        // Swallow the shell's gap-x-2 column gap while off canvas so the
        // shell edge keeps a constant spacing-2 inset whether the panel is
        // open (gap + panel + margin) or collapsed (gap + this).
        ...(side === "right"
          ? { marginLeft: offcanvas ? "-0.5rem" : "0rem" }
          : { marginRight: offcanvas ? "-0.5rem" : "0rem" }),
      }}
      // A drag has to land on the frame it happened — the morph spring would
      // trail the pointer and keep settling after the handle is released.
      transition={context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION}
      style={{ ...style, flexShrink: 0 }}
      className={cn(
        "group/sidebar relative h-full shrink-0 will-change-[width]",
        "peer flex!",
        side === "right" && "order-last",
        className
      )}
    >
      {collapsible !== "none" && (
        <div
          ref={gripRef}
          role="separator"
          aria-label={`Resize ${ariaLabel}`}
          aria-orientation="vertical"
          tabIndex={collapsed ? -1 : 0}
          aria-hidden={collapsed || undefined}
          className={cn(
            "inset-y-0 w-2 hover:bg-amber-300/20 data-resizing:bg-amber-300/20 absolute z-10 cursor-col-resize touch-none focus-visible:outline-2 focus-visible:outline-ring",
            collapsed && "pointer-events-none",
            side === "right" ? "-left-2" : "-right-2"
          )}
        />
      )}
      {/* The aside's own width animation is the whole layout story: the
          inner panel just fills it and fades, so it is masked to the aside's
          box here instead of clipping the aside itself — the aside must stay
          unclipped for the gap handle above to be hoverable. */}
      <div className={"contents"}>
        <motion.div
          initial={false}
          animate={{ opacity: offcanvas ? 0 : 1 }}
          transition={context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
          className={cn(
            "top-0 sticky flex w-full flex-col overflow-hidden",
            // Pin the right panel to the aside's trailing edge so the aside's
            // width animation expands the panel out of it instead of
            // revealing a detached strip.
            side === "right" && "ml-auto",

            // Panels fill the shell's container, not the viewport — the shell
            // owns its own scrolling, so a bounded host (docs demo, split
            // view) must bound the panels too. Full-page apps size the shell
            // itself (e.g., h-svh). The bottom gap comes from the shell
            // container's padding, so panels only carry their top offset.
            variant === "floating" && "mx-2 mt-2 h-[calc(100%-0.5rem)]",
            variant === "inset" && "mt-2 h-[calc(100%-0.5rem)]",

            panelClassName
          )}
        >
          <AnimatedSidebarPanelContext.Provider
            value={{ collapsed, collapsible, side }}
          >
            {children}
          </AnimatedSidebarPanelContext.Provider>
        </motion.div>
      </div>
    </motion.aside>
  )
}
