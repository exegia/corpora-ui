"use client"

import * as React from "react"

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react"
import { More } from "iconsax-reactjs"
import { LucideArrowUpDown, LucideChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PanelMenuButtonProps } from "./type"
import { floatingButtonClass, revealOnPanelHoverClass } from "./utils"
import { Button } from "@/components/ui/button";
import { GlassButtonGroup } from "@/components/ui/glasscn/glass-button-group.tsx"
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease.ts"
import { useHoverCapable } from "@/lib/hooks/use-hover-capable"
import { SCAFFOLD_MENU_COLLAPSE_DELAY } from "./constants"

/** Menu segments blur/fade in place while the track morphs around them. The
 * exit is a fast tween, not the layout spring — the track stays
 * overflow-visible, so the popped-out buttons must be gone before the
 * collapsing pill leaves them behind as a ghost. */
const MENU_SEGMENT_VARIANTS: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.18, ease: EASE_OUT },
  },
}

/**
 * Floating swap affordance centered on the seam between a panel's primary
 * surface and its secondary strip.
 */
export function PanelMenuButton({
  onClick,
  onExpand,
  secondaryExpanded = false,
  label,
  sound = true,
  className,
}: PanelMenuButtonProps): React.ReactElement {

  const reduce = useReducedMotion()
  const canHover = useHoverCapable()
  const actionsId = React.useId()
  const groupRef = React.useRef<HTMLDivElement>(null)
  const actionsRef = React.useRef<HTMLDivElement>(null)
  const actionsLeftRef = React.useRef(0)
  const [expanded, setExpanded] = React.useState(false);

  const transition = reduce ? { duration: 0 } : SPRING_LAYOUT

  const collapseTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const suppressHoverOpenUntilRef = React.useRef(0)
  const focusActionsOnOpenRef = React.useRef(false)

  React.useEffect(() => () => clearTimeout(collapseTimerRef.current), [])

  const cancelCollapse = React.useCallback(() => {
    clearTimeout(collapseTimerRef.current)
  }, [])

  // Arms when the pointer stops hovering the group: the menu lingers for the
  // grace period, then collapses — unless the pointer (or focus) came back.
  const armCollapse = React.useCallback(() => {
    if (!canHover) return
    clearTimeout(collapseTimerRef.current)
    collapseTimerRef.current = setTimeout(() => {
      // Focus keeps the menu open — don't collapse under the keyboard.
      if (groupRef.current?.contains(document.activeElement)) return
      setExpanded(false)
    }, SCAFFOLD_MENU_COLLAPSE_DELAY)
  }, [canHover])

  // The grace period must keep counting when the pointer leaves the whole
  // app — leaving the window can skip the group's own pointerleave, so arm
  // on viewport exit and window blur as well.
  React.useEffect(() => {
    if (!expanded || !canHover) return
    const root = document.documentElement
    root.addEventListener("pointerleave", armCollapse)
    window.addEventListener("blur", armCollapse)
    return () => {
      root.removeEventListener("pointerleave", armCollapse)
      window.removeEventListener("blur", armCollapse)
    }
  }, [expanded, canHover, armCollapse])

  // Click-opens replace the toggle with the actions — hand focus over so
  // keyboard users aren't dropped onto <body>.
  React.useEffect(() => {
    if (!expanded || !focusActionsOnOpenRef.current) return
    focusActionsOnOpenRef.current = false
    actionsRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
  }, [expanded])

  const collapse = () => {
    // The shrinking toggle can glide under a resting cursor and hover-reopen
    // the menu it just closed — ignore hover-opens until it has settled.
    suppressHoverOpenUntilRef.current = Date.now() + 600
    setExpanded(false)
  }

  // Acting collapses the menu — the pill returns to the compact toggle.
  const handleAction = (action?: () => void) => {
    action?.()
    collapse()
  }

  // Click open — the touch and keyboard path.
  const handleOnExpand = () => {
    if (document.activeElement === document.querySelector(
      "#scaffold-panel-menu-toggle-button"
    )) {
      focusActionsOnOpenRef.current = true
    }
    setExpanded(true)
  }

  // Hover on the toggle opens the menu (hover-capable devices only — touch
  // and keyboard go through the click toggle).
  const handleToggleHover = () => {
    if (!canHover || Date.now() < suppressHoverOpenUntilRef.current) return
    cancelCollapse()
    setExpanded(true)
  }

  // popLayout pops the exiting actions group out of the flow — pin it back to
  // where it sat so it stays visually attached to the toggle while leaving.
  React.useLayoutEffect(() => {
    const actionsNode = actionsRef.current
    if (!actionsNode) return

    if (!expanded) {
      actionsNode.style.left = `${
        actionsLeftRef.current - actionsNode.getBoundingClientRect().left
      }px`
      return
    }

    actionsNode.style.left = ""
    actionsLeftRef.current = actionsNode.getBoundingClientRect().left
  }, [expanded])

  return (
    <GlassButtonGroup
      ref={groupRef}
      layout
      transition={transition}
      onPointerEnter={cancelCollapse}
      onPointerLeave={armCollapse}
      glassVariant="subtle"
      className={cn(
        floatingButtonClass,
        revealOnPanelHoverClass,
        // Centered on the seam: secondary height (52px) + half the 10px gap.
        "absolute top-1/2 z-10 -translate-y-1/2 overflow-visible!",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {expanded ? (
          <motion.div
            key="menu-actions"
            ref={actionsRef}
            id={actionsId}
            layout
            variants={MENU_SEGMENT_VARIANTS}
            initial={reduce ? { opacity: 0 } : "hidden"}
            animate={reduce ? { opacity: 1 } : "visible"}
            exit={reduce ? { opacity: 0 } : "exit"}
            transition={transition}
            className="relative flex w-max items-stretch"
          >
            <Button
              id="scaffold-panel-menu-expand"
              aria-label={label}
              size="sm"
              variant="ghost"
              sound={sound}
              data-slot="scaffold-panel-menu-swap"
              // The motion wrapper hides these from the group's corner
              // selectors — restore what ButtonGroup would have applied.
              className="rounded-r-none"
              onClick={() => handleAction(onExpand)}
            >
              {/* Button's [&_svg]:transition-transform eases the flip. */}
              <LucideChevronDown
                size={16}
                className={cn(secondaryExpanded && "rotate-180")}
              />
              Expand
            </Button>
            <Button
              id="scaffold-panel-menu-swap"
              aria-label={label}
              size="sm"
              variant="ghost"
              sound={sound}
              data-slot="scaffold-panel-menu-swap"
              className="rounded-l-none border-l-0"
              onClick={() => handleAction(onClick)}
            >
              <LucideArrowUpDown size={16} />
              Swap
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="menu-toggle"
            layout
            variants={MENU_SEGMENT_VARIANTS}
            initial={reduce ? { opacity: 0 } : "hidden"}
            animate={reduce ? { opacity: 1 } : "visible"}
            exit={reduce ? { opacity: 0 } : "exit"}
            transition={transition}
            className="flex shrink-0"
          >
            <Button
              id="scaffold-panel-menu-toggle-button"
              aria-label={label}
              aria-expanded={expanded}
              size="icon-sm"
              variant="ghost"
              sound={sound}
              data-slot="scaffold-panel-menu-toggle"
              onClick={handleOnExpand}
              onPointerEnter={handleToggleHover}
            >
              <More size={16} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassButtonGroup>
  )
}
