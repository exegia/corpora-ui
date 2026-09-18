import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { useAnimatedSidebar } from "./utils"
import type { IAnimatedSidebarTriggerProps } from "./type"

export const AnimatedPanelTrigger = forwardRef<
  HTMLButtonElement,
  IAnimatedSidebarTriggerProps
>(function AnimatedSidebarTrigger(
  { onClick, side = "left", type = "button", ...props },
  forwardedRef
) {
  const context = useAnimatedSidebar()
  const expanded =
    side === "left" && context.fit.sidebar
      ? context.fit.sidebar.mode === "expanded"
      : context.open[side]
  const triggerRef = context.triggerRefs[side]

  // The right panel drops out of a viewport too narrow to hold it, so its
  // toggle would otherwise sit in the header driving nothing.
  if (side === "right" && !context.fit.fits) return null

  return (
    <Button
      {...props}
      ref={(node) => {
        triggerRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      disabled={
        props.disabled ||
        (side === "left" && context.fit.sidebar?.canExpand === false)
      }
      type={type}
      variant="ghost"
      size="icon-xl"
      aria-label={props["aria-label"] ?? "Toggle sidebar"}
      aria-expanded={expanded}
      data-slot="sidebar-trigger"
      data-side={side}
      data-state={expanded ? "expanded" : "collapsed"}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        context.toggleSidebar(side)
      }}
    />
  )
})
