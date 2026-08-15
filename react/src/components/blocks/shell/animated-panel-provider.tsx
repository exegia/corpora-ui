import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils.ts"
import type {
  AnimatedSidebarProviderProps,
  SidebarSide,
} from "./type"
import {
  AnimatedSidebarContext,
  SIDEBAR_KEYBOARD_SHORTCUT,
  useIsMobile,
} from "./utils"

export function AnimatedPanelProvider({
  children,
  open,
  defaultOpen,
  onOpenChange,
  openMobile,
  defaultOpenMobile,
  onOpenMobileChange,
  className,
  style,
  ...props
}: AnimatedSidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState<
    Record<SidebarSide, boolean>
  >(() => ({
    left: defaultOpen?.left ?? true,
    right: defaultOpen?.right ?? false,
  }))
  const [internalOpenMobile, setInternalOpenMobile] = useState<
    Record<SidebarSide, boolean>
  >(() => ({
    left: defaultOpenMobile?.left ?? false,
    right: defaultOpenMobile?.right ?? false,
  }))
  const isMobile = useIsMobile()
  const reduce = useReducedMotion() ?? false
  const generatedId = useId()
  const leftTriggerRef = useRef<HTMLButtonElement>(null)
  const rightTriggerRef = useRef<HTMLButtonElement>(null)

  // Per-side controlled/uncontrolled merge — a side is controlled exactly
  // when its key is present on the controlled record.
  const controlledLeft = open?.left
  const controlledRight = open?.right
  const controlledMobileLeft = openMobile?.left
  const controlledMobileRight = openMobile?.right

  const openState = useMemo<Record<SidebarSide, boolean>>(
    () => ({
      left: controlledLeft ?? internalOpen.left,
      right: controlledRight ?? internalOpen.right,
    }),
    [controlledLeft, controlledRight, internalOpen]
  )
  const openMobileState = useMemo<Record<SidebarSide, boolean>>(
    () => ({
      left: controlledMobileLeft ?? internalOpenMobile.left,
      right: controlledMobileRight ?? internalOpenMobile.right,
    }),
    [controlledMobileLeft, controlledMobileRight, internalOpenMobile]
  )

  const setOpen = useCallback(
    (nextOpen: boolean, side: SidebarSide) => {
      const controlled = side === "left" ? controlledLeft : controlledRight
      if (controlled === undefined) {
        setInternalOpen((prev) =>
          prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
        )
      }
      onOpenChange?.(nextOpen, side)
    },
    [controlledLeft, controlledRight, onOpenChange]
  )

  const setOpenMobile = useCallback(
    (nextOpen: boolean, side: SidebarSide) => {
      const controlled =
        side === "left" ? controlledMobileLeft : controlledMobileRight
      if (controlled === undefined) {
        setInternalOpenMobile((prev) =>
          prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
        )
      }
      onOpenMobileChange?.(nextOpen, side)
    },
    [controlledMobileLeft, controlledMobileRight, onOpenMobileChange]
  )

  const toggleSidebar = useCallback(
    (side: SidebarSide) => {
      if (isMobile) setOpenMobile(!openMobileState[side], side)
      else setOpen(!openState[side], side)
    },
    [isMobile, openMobileState, openState, setOpen, setOpenMobile]
  )

  const triggerRefs = useMemo(
    () => ({ left: leftTriggerRef, right: rightTriggerRef }),
    []
  )

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar("left")
      }
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [toggleSidebar])

  return (
    <AnimatedSidebarContext.Provider
      value={{
        isMobile,
        layoutId: `${generatedId}-active`,
        open: openState,
        openMobile: openMobileState,
        reduce,
        setOpen,
        setOpenMobile,
        toggleSidebar,
        triggerRefs,
      }}
    >
      <div
        {...props}
        data-slot="sidebar-wrapper"
        data-state-left={openState.left ? "expanded" : "collapsed"}
        data-state-right={openState.right ? "expanded" : "collapsed"}
        style={{
          "--sidebar-width": "19rem",
          "--sidebar-width-icon": "4.25rem",
          "--sidebar-width-mobile": "18rem",
          ...style,
        }}
        className={cn(
          "group/sidebar-wrapper flex w-full min-w-0 gap-x-2",
          className
        )}
      >
        {children}
      </div>
    </AnimatedSidebarContext.Provider>
  )
}
