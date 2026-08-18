"use client"
// beui.dev/components/motion/animated-sidebar

import { motion, type PanInfo } from "motion/react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { EASE_OUT } from "@/lib/ease.ts"
import { cn } from "@/lib/utils"
import type { AnimatedSidebarProps } from "./type"
import {
  AnimatedSidebarPanelContext,
  expandedWidthVar,
  SIDEBAR_MORPH_TRANSITION,
  PANEL_TRANSITION,
  REDUCED_TRANSITION,
  useAnimatedSidebar,
} from "./utils"

/** How far one arrow key moves the panel edge (shift = coarse step). */
const RESIZE_STEP = 16
const RESIZE_STEP_COARSE = 64

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
  const { bounds, panelWidth, resetPanelWidth, resizePanel } = context.fit
  const sideOpen = context.open[side]
  const collapsed = collapsible !== "none" && !sideOpen
  const offcanvas = collapsed && collapsible === "offcanvas"

  // Only the expanded secondary panel is resizable: the rail is pinned to its
  // own columns, and a collapsed panel has no edge left to grab.
  const resizable =
    side === "right" && collapsible === "offcanvas" && !collapsed

  const resizeStartRef = useRef(0)
  const [resizing, setResizing] = useState(false)

  const baseWidth = offcanvas
    ? 0
    : collapsed
      ? "var(--sidebar-width-icon)"
      : expandedWidthVar(side)
  // The secondary panel's width is shell state, not panel state: the shell
  // measured it, re-clamps it when the room changes, and hands back the same
  // width after a collapse. Everything else rides the CSS variables, which
  // also covers the server render, where nothing has been measured yet.
  const width = resizable && panelWidth !== null ? panelWidth : baseWidth

  const setPanelRef = useCallback(
    (node: HTMLElement | null) => {
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const handleResizeStart = useCallback(() => {
    resizeStartRef.current = panelWidth ?? bounds.min
    setResizing(true)
  }, [bounds.min, panelWidth])

  const handleResize = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      // The handle rides the panel's inner edge, so the panel grows as the
      // pointer travels left. `offset` is measured from the pointer-down
      // point, so the edge tracks it 1:1 instead of accumulating rounding.
      resizePanel(resizeStartRef.current - info.offset.x)
    },
    [resizePanel]
  )

  const handleResizeEnd = useCallback(() => setResizing(false), [])

  const handleResizeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const direction =
        event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0
      if (!direction) return

      event.preventDefault()
      const step = event.shiftKey ? RESIZE_STEP_COARSE : RESIZE_STEP
      resizePanel((panelWidth ?? bounds.min) + direction * step)
    },
    [bounds.min, panelWidth, resizePanel]
  )

  // The pointer leaves the 2px handle the moment the drag starts, so the
  // cursor and the text selection have to be held on the document instead.
  useEffect(() => {
    if (!resizing) return

    const { body } = document
    const previousCursor = body.style.cursor
    const previousUserSelect = body.style.userSelect
    body.style.cursor = "col-resize"
    body.style.userSelect = "none"

    return () => {
      body.style.cursor = previousCursor
      body.style.userSelect = previousUserSelect
    }
  }, [resizing])

  // A secondary panel exists only while the viewport can carry it beside the
  // rail and the body at their own floors. Below that there is nothing to dock
  // into, so the panel stands down rather than squeezing the content column —
  // and its trigger stands down with it.
  if (side === "right" && !context.fit.fits) return null

  if (context.isMobile) return <div>TODO: Create Mobile nav experience</div>

  return (
    <motion.aside
      {...props}
      ref={setPanelRef}
      initial={false}
      aria-label={ariaLabel}
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      data-resizing={resizing ? "" : undefined}
      animate={{
        width,
        // Swallow the shell's gap-x-2 column gap while off canvas so the
        // shell edge keeps a constant spacing-2 inset whether the panel is
        // open (gap + panel + margin) or collapsed (gap + this).
        ...(side === "right"
          ? { marginLeft: offcanvas ? "-0.5rem" : "0rem" }
          : { marginRight: offcanvas ? "-0.5rem" : "0rem" }),
      }}
      // A drag has to land on the frame it happened — the morph spring would
      // trail the pointer and keep settling after the handle is released.
      transition={
        resizing || context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION
      }
      style={style}
      className={cn(
        "group/sidebar relative hidden h-full shrink-0 will-change-[width] md:block",
        "peer flex!",
        side === "right" && "order-last",
        className
      )}
    >
      {resizable && (
        // The handle occupies the shell's gap-x-2 column gap. It must stay
        // outside the clipping mask below or the gap would never receive
        // hover — clipping cuts hit-testing, not just painting.
        <motion.div
          role="separator"
          aria-label={`Resize ${ariaLabel}`}
          aria-orientation="vertical"
          tabIndex={0}
          className="absolute inset-y-0 -left-2 z-10 w-2 cursor-col-resize touch-none"
          initial="idle"
          // Hover alone would drop the glow the instant the drag leaves the
          // handle, so the gesture pins it open for the whole drag.
          animate={resizing ? "hover" : "idle"}
          whileHover="hover"
          whileFocus="hover"
          onPanStart={handleResizeStart}
          onPan={handleResize}
          onPanEnd={handleResizeEnd}
          onKeyDown={handleResizeKeyDown}
          // The usual escape hatch out of a width you dragged to.
          onDoubleClick={resetPanelWidth}
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
      <div className={"contents"}>
        <motion.div
          initial={false}
          animate={{
            opacity: offcanvas ? 0 : 1,
            width: offcanvas ? "0%" : "100%",
          }}
          transition={context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
          className={cn(
            "sticky top-0 flex flex-col overflow-hidden",
            //   collapsible === "offcanvas" && "w-(--sidebar-width)",
            // Pin the right panel to the aside's trailing edge so the width
            // animation expands the panel out of it instead of revealing a
            // detached strip.
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
