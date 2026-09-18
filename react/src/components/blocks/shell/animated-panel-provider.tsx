import { useAtomValueRawSync, useSetAtom } from "jotai"
import { removeShellFitInstance } from "./shell-fit-atom"
import { shellPanelAtoms } from "./shell-panel-atom"
import { useCallback, useEffect, useId, useMemo, useRef } from "react"
import { useIsomorphicLayoutEffect, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils.ts"
import type { IAnimatedSidebarProviderProps, TSidebarSide } from "./type"
import { useShellFit } from "./use-shell-fit"
import {
  AnimatedSidebarContext,
  SHELL_WIDTHS,
  SIDEBAR_KEYBOARD_SHORTCUT,
  useIsMobile,
} from "./utils"

export function AnimatedPanelProvider({
  children,
  shellId,
  defaultPanelWidth,
  open,
  defaultOpen,
  onOpenChange,
  openMobile,
  defaultOpenMobile,
  onOpenMobileChange,
  onNarrowChange,
  // ShellLayout renders this; the bare provider only keeps it off the DOM.
  panelComponents: _panelComponents,
  className,
  style,
  ...props
}: IAnimatedSidebarProviderProps) {
  const generatedId = useId()
  const resolvedId = shellId ?? generatedId
  useEffect(() => {
    if (shellId !== undefined) return
    return () => removeShellFitInstance(resolvedId)
  }, [resolvedId, shellId])
  const atoms = shellPanelAtoms(resolvedId)
  const railWidth = useAtomValueRawSync(atoms.railWidth)
  const internalOpen = useAtomValueRawSync(atoms.open)
  const internalOpenMobile = useAtomValueRawSync(atoms.mobile)
  const setInternalOpen = useSetAtom(atoms.open)
  const setInternalOpenMobile = useSetAtom(atoms.mobile)
  const seed = useSetAtom(atoms.seed)
  const publish = useSetAtom(atoms.handlers)
  useEffect(() => {
    seed(defaultOpen, defaultOpenMobile)
  }, [seed, defaultOpen, defaultOpenMobile])
  const isMobile = useIsMobile()
  const reduce = useReducedMotion() ?? false
  const leftTriggerRef = useRef<HTMLButtonElement>(null)
  const rightTriggerRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // The narrow gate below is consulted by the setters, but the verdict comes
  // from `useShellFit` further down — which needs those very setters to retire
  // the panel. A ref unwinds the cycle: a setter only ever runs from an event,
  // by which time the layout effect has published the current verdict.
  const fitsRef = useRef(true)
  const sidebarCanExpandRef = useRef(true)

  // Per-side controlled/uncontrolled merge — a side is controlled exactly
  // when its key is present on the controlled record.
  const controlledLeft = open?.left
  const controlledRight = open?.right
  const controlledMobileLeft = openMobile?.left
  const controlledMobileRight = openMobile?.right

  const openState = useMemo<Record<TSidebarSide, boolean>>(
    () => ({
      left: controlledLeft ?? internalOpen.left,
      right: controlledRight ?? internalOpen.right,
    }),
    [controlledLeft, controlledRight, internalOpen]
  )
  const openMobileState = useMemo<Record<TSidebarSide, boolean>>(
    () => ({
      left: controlledMobileLeft ?? internalOpenMobile.left,
      right: controlledMobileRight ?? internalOpenMobile.right,
    }),
    [controlledMobileLeft, controlledMobileRight, internalOpenMobile]
  )

  // The right panel is not on screen while the shell is too narrow to hold
  // it, so opening it would only ever surface later as a panel nobody asked
  // for. Closing always goes through — that is how state left over from a
  // wider viewport clears.
  const setOpen = useCallback(
    (nextOpen: boolean, side: TSidebarSide) => {
      if (nextOpen && side === "right" && !fitsRef.current) return
      if (nextOpen && side === "left" && !sidebarCanExpandRef.current) return

      const controlled = side === "left" ? controlledLeft : controlledRight
      if (controlled === undefined) {
        setInternalOpen((prev) =>
          prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
        )
      }
      onOpenChange?.(nextOpen, side)
    },
    [controlledLeft, controlledRight, onOpenChange, setInternalOpen]
  )

  const setOpenMobile = useCallback(
    (nextOpen: boolean, side: TSidebarSide) => {
      if (nextOpen && side === "right" && !fitsRef.current) return
      if (nextOpen && side === "left" && !sidebarCanExpandRef.current) return

      const controlled =
        side === "left" ? controlledMobileLeft : controlledMobileRight
      if (controlled === undefined) {
        setInternalOpenMobile((prev) =>
          prev[side] === nextOpen ? prev : { ...prev, [side]: nextOpen }
        )
      }
      onOpenMobileChange?.(nextOpen, side)
    },
    [
      controlledMobileLeft,
      controlledMobileRight,
      onOpenMobileChange,
      setInternalOpenMobile,
    ]
  )

  useEffect(() => {
    publish({ setOpen, setOpenMobile })
    return () => publish(null)
  }, [publish, setOpen, setOpenMobile])
  useEffect(() => {
    if (controlledLeft !== undefined || controlledRight !== undefined)
      setInternalOpen((previous) => ({ ...previous, ...open }))
  }, [controlledLeft, controlledRight, open, setInternalOpen])
  useEffect(() => {
    if (
      controlledMobileLeft !== undefined ||
      controlledMobileRight !== undefined
    )
      setInternalOpenMobile((previous) => ({ ...previous, ...openMobile }))
  }, [
    controlledMobileLeft,
    controlledMobileRight,
    openMobile,
    setInternalOpenMobile,
  ])

  const toggleSidebar = useCallback(
    (side: TSidebarSide) => {
      if (side === "left" && !sidebarCanExpandRef.current) return
      setOpen(!openState[side], side)
    },
    [openState, setOpen]
  )

  const triggerRefs = useMemo(
    () => ({ left: leftTriggerRef, right: rightTriggerRef }),
    []
  )

  // A measurement that lands on "no room" retires the right panel's open
  // state instead of parking it: a panel that survived the crossing would
  // spring back the moment the viewport widened, long after the user asked
  // for it. Closing is the one write the narrow gate lets through, and the
  // guards keep a repeated verdict from re-reporting a panel already shut.
  //
  // It rides a ref so `useShellFit` can call the latest one from a listener
  // it bound once, and it is a layout effect declared FIRST so the ref is
  // filled before that listener takes its opening measurement.
  const retireRightPanelRef = useRef<() => void>(() => {})
  useIsomorphicLayoutEffect(() => {
    retireRightPanelRef.current = () => {
      if (openState.right) setOpen(false, "right")
      if (openMobileState.right) setOpenMobile(false, "right")
    }
  })
  const retireRightPanel = useCallback(() => retireRightPanelRef.current(), [])

  // Everything about the shell's columns — whether a secondary panel fits,
  // how wide it is, how far it may be dragged — lives in this one hook, and
  // in the shell-fit atoms it writes to under `shellId`. The rail's fold is an
  // input because its column is part of the room the panel needs.
  const fit = useShellFit({
    shellId: resolvedId,
    hostRef: wrapperRef,
    railOpen: openState.left,
    defaultPanelWidth,
    onUnfit: retireRightPanel,
  })
  const isNarrow = !fit.fits
  useIsomorphicLayoutEffect(() => {
    fitsRef.current = fit.fits
    sidebarCanExpandRef.current = fit.sidebar?.canExpand ?? true
  })

  // The verdict has to travel up to whoever renders the provider —
  // useShellPanels, a title bar — since context only flows down. The
  // listener above is bound once, so the callback rides a ref rather than
  // rebinding it whenever a consumer passes a fresh arrow.
  const onNarrowChangeRef = useRef(onNarrowChange)
  useEffect(() => {
    onNarrowChangeRef.current = onNarrowChange
  })

  // Only real crossings are news: a resize that leaves the verdict alone is
  // silent, and so is the mount default the consumer already holds.
  const reportedNarrowRef = useRef(false)
  useEffect(() => {
    if (reportedNarrowRef.current === isNarrow) return
    reportedNarrowRef.current = isNarrow
    onNarrowChangeRef.current?.(isNarrow)
  }, [isNarrow])

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
        fit,
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
        ref={wrapperRef}
        data-slot="sidebar-wrapper"
        data-narrow={isNarrow ? "" : undefined}
        data-sidebar-mode={fit.sidebar?.mode}
        data-state-left={
          (fit.sidebar ? fit.sidebar.mode === "expanded" : openState.left)
            ? "expanded"
            : "collapsed"
        }
        data-state-right={openState.right ? "expanded" : "collapsed"}
        style={{
          ...SHELL_WIDTHS,
          ...style,
          ...(railWidth !== null && { "--sidebar-width": `${railWidth}px` }),
        }}
        className={cn(
          "group/sidebar-wrapper min-w-0 gap-x-2 flex w-full overflow-hidden",
          className
        )}
      >
        {children}
      </div>
    </AnimatedSidebarContext.Provider>
  )
}
