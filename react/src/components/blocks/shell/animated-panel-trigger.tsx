import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { useAnimatedSidebar } from "./utils"
import type { AnimatedSidebarTriggerProps } from "./type"

export const AnimatedPanelTrigger = forwardRef<
  HTMLButtonElement,
  AnimatedSidebarTriggerProps
>(function AnimatedSidebarTrigger(
  { onClick, side = "left", type = "button", ...props },
  forwardedRef
) {
  const context = useAnimatedSidebar()
  const expanded = context.isMobile
    ? context.openMobile[side]
    : context.open[side]
  const triggerRef = context.triggerRefs[side]

  return (
    <Button
      {...props}
      ref={(node) => {
        triggerRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
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
