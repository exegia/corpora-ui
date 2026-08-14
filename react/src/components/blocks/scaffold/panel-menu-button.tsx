"use client"

import * as React from "react"

import { More } from "iconsax-reactjs"
import { LucideArrowUpDown, LucideChevronDown, LucideX } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PanelMenuButtonProps } from "./type"
import { floatingButtonClass, revealOnPanelHoverClass } from "./utils"
import { Button } from "@/components/ui/button"
import { GlassButtonGroup } from "@/components/ui/glasscn/glass-button-group.tsx"
import { useHoverCapable } from "@/lib/hooks/use-hover-capable"
import { SCAFFOLD_MENU_COLLAPSE_DELAY } from "./constants"

/** One side of the seam menu. Both sides stay mounted; the pill morphs by
 * collapsing one side's grid column to 0fr while the other grows — pure
 * CSS, driven by `data-expanded` on the group. The hidden side is inert
 * and aria-hidden so it can't be clicked, focused or found by queries. */
const menuCellClass =
  "grid transition-[grid-template-columns,opacity] duration-300 ease-smooth-out motion-reduce:transition-none"

/**
 * Floating menu affordance centered on the seam between a panel's primary
 * surface and its secondary strip: a compact ⋯ toggle that morphs into the
 * Expand | Swap (| Close) actions.
 */
export function PanelMenuButton({
  onClick,
  onExpand,
  onCloseSecondary,
  secondaryExpanded = false,
  label,
  sound = true,
  className,
}: PanelMenuButtonProps): React.ReactElement {
  const canHover = useHoverCapable()
  const actionsId = React.useId()
  const groupRef = React.useRef<HTMLDivElement>(null)
  const actionsRef = React.useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = React.useState(false);

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
  // keyboard users aren't dropped onto an inert control.
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
    if (groupRef.current?.contains(document.activeElement)) {
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

  return (
    <GlassButtonGroup
      ref={groupRef}
      onPointerEnter={cancelCollapse}
      onPointerLeave={armCollapse}
      glassVariant="subtle"
      data-expanded={expanded ? "" : undefined}
      className={cn(
        floatingButtonClass,
        revealOnPanelHoverClass,
        "group/menu absolute top-1/2 z-10 -translate-y-1/2",
        className
      )}
    >
      <div
        aria-hidden={expanded || undefined}
        inert={expanded || undefined}
        className={cn(
          menuCellClass,
          "grid-cols-[1fr] opacity-100 group-data-expanded/menu:grid-cols-[0fr] group-data-expanded/menu:opacity-0"
        )}
      >
        <div className="flex min-w-0 overflow-hidden">
          <Button
            id="scaffold-panel-menu-toggle-button"
            aria-label={label}
            aria-expanded={expanded}
            aria-controls={actionsId}
            size="icon-sm"
            variant="ghost"
            sound={sound}
            data-slot="scaffold-panel-menu-toggle"
            onClick={handleOnExpand}
            onPointerEnter={handleToggleHover}
          >
            <More size={16} />
          </Button>
        </div>
      </div>
      <div
        id={actionsId}
        ref={actionsRef}
        aria-hidden={!expanded || undefined}
        inert={!expanded || undefined}
        className={cn(
          menuCellClass,
          "grid-cols-[0fr] opacity-0 group-data-expanded/menu:grid-cols-[1fr] group-data-expanded/menu:opacity-100"
        )}
      >
        <div className="flex min-w-0 overflow-hidden">
          <Button
            id="scaffold-panel-menu-expand"
            size="sm"
            variant="ghost"
            sound={sound}
            data-slot="scaffold-panel-menu-expand"
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
            size="sm"
            variant="ghost"
            sound={sound}
            data-slot="scaffold-panel-menu-swap"
            className={cn(
              "border-l-0",
              onCloseSecondary ? "rounded-none" : "rounded-l-none"
            )}
            onClick={() => handleAction(onClick)}
          >
            <LucideArrowUpDown size={16} />
            Swap
          </Button>
          {onCloseSecondary && (
            <Button
              id="scaffold-panel-menu-close"
              size="sm"
              variant="ghost"
              sound={sound}
              data-slot="scaffold-panel-menu-close"
              className="rounded-l-none border-l-0"
              onClick={() => handleAction(onCloseSecondary)}
            >
              <LucideX size={16} />
              Close
            </Button>
          )}
        </div>
      </div>
    </GlassButtonGroup>
  )
}
