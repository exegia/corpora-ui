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
  SIDEBAR_MORPH_TRANSITION,
  PANEL_TRANSITION,
  REDUCED_TRANSITION,
  useAnimatedSidebar,
} from "./utils"

/** How far one arrow key moves the panel edge (shift = coarse step). */
const RESIZE_STEP = 16
const RESIZE_STEP_COARSE = 64

interface ResizeBounds {
  /** Panel width in px when the gesture started. */
  width: number
  /** `var(--sidebar-width)` in px — the floor the panel may not cross. */
  min: number
  /** How far the panel may grow before the inset hits its own min-width. */
  max: number
}

/** Resolve a CSS length — `var()` included — to px inside `host`'s cascade.
 * Custom properties inherit, so a throwaway probe mounted in the panel reads
 * the very `--sidebar-width` the panel animates to, including a value a
 * consumer overrode on the provider. */
function resolveLength(host: HTMLElement, value: string) {
  const probe = document.createElement("div")
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${value}`
  host.appendChild(probe)
  const px = probe.getBoundingClientRect().width
  probe.remove()
  return px
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

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

  // Only an expanded offcanvas panel is resizable: the icon rail is pinned to
  // --sidebar-width-icon, and a collapsed panel has no edge left to grab.
  const resizable = collapsible === "offcanvas" && !collapsed

  const panelRef = useRef<HTMLElement | null>(null)
  const boundsRef = useRef<ResizeBounds | null>(null)
  const [resizedWidth, setResizedWidth] = useState<number | null>(null)
  const [resizing, setResizing] = useState(false)

  const baseWidth = offcanvas
    ? 0
    : collapsed
      ? "var(--sidebar-width-icon)"
      : "var(--sidebar-width)"
  // A drag overrides the base width only while the panel stays resizable, so
  // collapsing falls back to the rail widths on its own — and reopening
  // restores the width the user dragged to.
  const width = resizable && resizedWidth !== null ? resizedWidth : baseWidth

  const setPanelRef = useCallback(
    (node: HTMLElement | null) => {
      panelRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  /** Read the gesture's limits off the live DOM rather than off state — the
   * floor is a CSS variable and the ceiling depends on what the inset can
   * still give up, and both can change between two drags. */
  const measureBounds = useCallback((): ResizeBounds | null => {
    const panel = panelRef.current
    if (!panel) return null

    const current = panel.getBoundingClientRect().width
    const min = resolveLength(panel, "var(--sidebar-width)")
    // Past the inset's own min-width the flex row would overflow instead of
    // the panel growing, so that slack is the whole resize headroom.
    const inset = panel.parentElement?.querySelector<HTMLElement>(
      '[data-slot="sidebar-inset"]'
    )
    const slack = inset
      ? inset.getBoundingClientRect().width -
        (Number.parseFloat(getComputedStyle(inset).minWidth) || 0)
      : 0

    return {
      width: current,
      min,
      max: Math.max(min, current + Math.max(0, slack)),
    }
  }, [])

  const applyResize = useCallback(
    (bounds: ResizeBounds, delta: number) => {
      // The handle rides the panel's inner edge, so a right panel grows as
      // the pointer travels left, and a left panel as it travels right.
      const grow = side === "right" ? -delta : delta
      setResizedWidth(clamp(bounds.width + grow, bounds.min, bounds.max))
    },
    [side]
  )

  const handleResizeStart = useCallback(() => {
    const bounds = measureBounds()
    if (!bounds) return
    boundsRef.current = bounds
    setResizing(true)
  }, [measureBounds])

  const handleResize = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      const bounds = boundsRef.current
      if (!bounds) return
      // `offset` is measured from the pointer-down point, so the panel tracks
      // the pointer 1:1 instead of accumulating rounding per frame.
      applyResize(bounds, info.offset.x)
    },
    [applyResize]
  )

  const handleResizeEnd = useCallback(() => {
    boundsRef.current = null
    setResizing(false)
  }, [])

  const handleResizeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const direction =
        event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
      if (!direction) return

      const bounds = measureBounds()
      if (!bounds) return

      event.preventDefault()
      const step = event.shiftKey ? RESIZE_STEP_COARSE : RESIZE_STEP
      applyResize(bounds, direction * step)
    },
    [applyResize, measureBounds]
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
          className={cn(
            "absolute inset-y-0 z-10 w-2 cursor-col-resize touch-none",
            side === "right" ? "-left-2" : "-right-2"
          )}
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
