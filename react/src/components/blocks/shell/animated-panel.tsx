"use client"
// beui.dev/components/motion/animated-sidebar

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { AnimatedSidebarProps } from "./type"
import {
  AnimatedSidebarPanelContext,
  SIDEBAR_MORPH_TRANSITION,
  PANEL_TRANSITION,
  REDUCED_TRANSITION,
  useAnimatedSidebar
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
}: AnimatedSidebarProps) {
  const context = useAnimatedSidebar()
  const sideOpen = context.open[side]
  const collapsed = collapsible !== "none" && !sideOpen
  const offcanvas = collapsed && collapsible === "offcanvas"
  const width = offcanvas
    ? "0px"
    : collapsed
      ? "var(--sidebar-width-icon)"
      : "var(--sidebar-width)"

  if (context.isMobile) return <div>TODO: Create Mobile nav experience</div>

  return (
    <motion.aside
      {...props}
      ref={ref}
      initial={false}
      aria-label={ariaLabel}
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      animate={{ width }}
      transition={context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION}
      style={style}
      className={cn(
        "group/sidebar relative hidden h-auto shrink-0 will-change-[width] md:block",
        "peer flex!",
        // The off canvas panel keeps its full width and slides out of the
        // zero-width rail, so clip it rather than letting it bleed past the
        // shell edge. The clip margin lets the panel's own shadow escape
        // without letting the slid-out panel escape with it
        collapsible === "offcanvas" &&
          "overflow-x-visible [overflow-clip-margin:1rem]",
        side === "right" && "order-las",
        className
      )}
    >
      {side === "right" && !collapsed && (
        <motion.div className="group relative flex max-h-full cursor-col-resize justify-center p-1">
          <motion.div className="absolute h-full w-full scale-y-0 animate-in bg-radial/decreasing from-amber-300/70 to-amber-500/0 to-40% transition-[colors,scale] duration-200 ease-smooth-out group-hover:scale-y-100" />
        </motion.div>
      )}
      <motion.div
        initial={false}
        animate={{
          opacity: offcanvas ? 0 : 1,
          x: offcanvas ? (side === "left" ? "-100%" : "100%") : "0%",
        }}
        transition={context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
        className={cn(
          "sticky top-0 flex flex-col overflow-hidden",
          collapsible === "offcanvas" && "w-(--sidebar-width)",

          variant === "floating" && "m-2 h-[calc(100svh-1rem)]",
          variant === "inset" && "my-2 h-[calc(100svh-1rem)]",
          variant === "inset" &&
            side === "right" &&
            "w-[calc(var(--sidebar-width)-0.7rem)]",

          panelClassName
        )}
      >
        <AnimatedSidebarPanelContext.Provider
          value={{ collapsed, collapsible, side }}
        >
          {children}
        </AnimatedSidebarPanelContext.Provider>
      </motion.div>
    </motion.aside>
  )
}
