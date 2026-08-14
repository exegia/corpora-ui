"use client"
// beui.dev/components/motion/animated-sidebar

import { motion } from "motion/react"
import { EASE_OUT } from "@/lib/ease.ts"
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
      animate={{
        width,
        // Swallow the shell's gap-x-2 column gap while off canvas so the
        // shell edge keeps a constant spacing-2 inset whether the panel is
        // open (gap + panel + margin) or collapsed (gap + this).
        ...(side === "right"
          ? { marginLeft: offcanvas ? "-0.5rem" : "0rem" }
          : { marginRight: offcanvas ? "-0.5rem" : "0rem" }),
      }}
      transition={context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION}
      style={style}
      className={cn(
        "group/sidebar relative hidden h-full shrink-0 will-change-[width] md:block",
        "peer flex!",
        side === "right" && "order-last",
        className
      )}
    >
      {side === "right" && !collapsed && (
        // The handle occupies the shell's gap-x-2 column gap. It must stay
        // outside the clipping mask below or the gap would never receive
        // hover — clipping cuts hit-testing, not just painting.
        <motion.div
          className="absolute inset-y-0 -left-2 z-10 w-2 cursor-col-resize"
          initial="idle"
          whileHover="hover"
        >
          <motion.div
            variants={{ idle: { scaleY: 0 }, hover: { scaleY: 1 } }}
            transition={
              context.reduce
                ? { duration: 0 }
                : { duration: 0.2, ease: EASE_OUT }
            }
            className="h-full w-full bg-radial/decreasing from-amber-300/70 to-amber-500/0 to-40%"
          />
        </motion.div>
      )}
      {/* The off canvas panel keeps its full width and slides out of the
          zero-width rail, so mask it to the aside's box here instead of
          clipping the aside itself — the aside must stay unclipped for the
          gap handle above to be hoverable. */}
      <div
        className={
          collapsible === "offcanvas"
            ? "absolute inset-0 overflow-hidden rounded-[inherit]"
            : "contents"
        }
      >
         //   collapsible === "offcanvas" && "w-(--sidebar-width)",
            // Pin the right panel to the aside's trailing edge so the width
            // animation expands the panel out of it instead of revealing a
            // detached strip.
            side === "right" && "ml-auto",

          variant === "floating" && "m-2 h-[calc(100svh-1rem)]",
          variant === "inset" && "my-2 h-[calc(100svh-1rem)]",
          variant === "inset" &&
            side === "right" &&
            "w-[calc(var(--sidebar-width)-0.7rem)]",

          panelClassName
        )}
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
