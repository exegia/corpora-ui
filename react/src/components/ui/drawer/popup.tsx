"use client"

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { XIcon } from "lucide-react"
import type React from "react"
import { useContext } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { DrawerPosition } from "./type"
import { DrawerContext } from "./context"
import DrawerPortal from "./portal"
import DrawerBackdrop from "./backdrop"
import DrawerViewport from "./viewport"
import DrawerBar from "./bar"

export default function DrawerPopup({
  className,
  children,
  showCloseButton = false,
  position: positionProp,
  variant = "default",
  showBar = false,
  portalProps,
  ...props
}: DrawerPrimitive.Popup.Props & {
  showCloseButton?: boolean
  position?: DrawerPosition
  variant?: "default" | "straight" | "inset"
  showBar?: boolean
  portalProps?: DrawerPrimitive.Portal.Props
}): React.ReactElement {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition

  return (
    <DrawerPortal {...portalProps}>
      <DrawerBackdrop />
      <DrawerViewport position={position} variant={variant}>
        <DrawerPrimitive.Popup
          className={cn(
            "min-h-0 min-w-0 shadow-lg/5 [--peek:calc(--spacing(6)-1px)] before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)] relative flex max-h-full w-full flex-col bg-popover text-popover-foreground transition-[transform,box-shadow,height,background-color] duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform outline-none [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))] [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--shrink:calc(1-var(--scale))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05] not-dark:bg-clip-padding before:pointer-events-none before:absolute after:pointer-events-none after:absolute after:bg-popover data-ending-style:shadow-transparent data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(2%*(var(--nested-drawers)-var(--stack-progress))))] data-starting-style:shadow-transparent data-swiping:select-none dark:data-nested-drawer-open:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(6%*(var(--nested-drawers)-var(--stack-progress))))]",
            "touch-none",
            position === "bottom" &&
              "after:inset-x-0 has-data-[slot=drawer-bar]:pt-2 data-ending-style:mb-0 data-starting-style:mb-0 data-ending-style:pb-0 data-starting-style:pb-0 row-start-2 -mb-[max(0px,calc(var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))] transform-[translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] border-t pb-[max(0px,calc(env(safe-area-inset-bottom,0px)+var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))] not-data-starting-style:not-data-ending-style:transition-[transform,box-shadow,height,background-color,margin,padding] after:top-full after:h-(--bleed) data-ending-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))] data-starting-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))]",
            position === "top" &&
              "after:inset-x-0 has-data-[slot=drawer-bar]:pb-2 transform-[translateY(var(--drawer-swipe-movement-y))] border-b after:bottom-full after:h-(--bleed) data-ending-style:transform-[translateY(calc(-100%-var(--inset)))] data-starting-style:transform-[translateY(calc(-100%-var(--inset)))]",
            position === "left" &&
              "w-[calc(100%-(--spacing(12)))] max-w-md after:inset-y-0 has-data-[slot=drawer-bar]:pe-2 transform-[translateX(var(--drawer-swipe-movement-x))] border-e after:end-full after:w-(--bleed) data-ending-style:transform-[translateX(calc(-100%-var(--inset)))] data-starting-style:transform-[translateX(calc(-100%-var(--inset)))]",
            position === "right" &&
              "w-[calc(100%-(--spacing(12)))] max-w-md after:inset-y-0 has-data-[slot=drawer-bar]:ps-2 col-start-2 transform-[translateX(var(--drawer-swipe-movement-x))] border-s after:start-full after:w-(--bleed) data-ending-style:transform-[translateX(calc(100%+var(--inset)))] data-starting-style:transform-[translateX(calc(100%+var(--inset)))]",
            variant !== "straight" &&
              cn(
                position === "bottom" && "rounded-t-2xl",
                position === "top" &&
                  "rounded-b-2xl **:data-[slot=drawer-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
                position === "left" &&
                  "rounded-e-2xl **:data-[slot=drawer-footer]:rounded-ee-[calc(var(--radius-2xl)-1px)]",
                position === "right" &&
                  "rounded-s-2xl **:data-[slot=drawer-footer]:rounded-es-[calc(var(--radius-2xl)-1px)]"
              ),
            variant === "default" &&
              cn(
                position === "bottom" &&
                  "before:rounded-t-[calc(var(--radius-2xl)-1px)]",
                position === "top" &&
                  "before:rounded-b-[calc(var(--radius-2xl)-1px)]",
                position === "left" &&
                  "before:rounded-e-[calc(var(--radius-2xl)-1px)]",
                position === "right" &&
                  "before:rounded-s-[calc(var(--radius-2xl)-1px)]"
              ),
            variant === "inset" &&
              "sm:rounded-2xl sm:border sm:after:bg-transparent sm:before:rounded-[calc(var(--radius-2xl)-1px)] sm:**:data-[slot=drawer-footer]:rounded-b-[calc(var(--radius-2xl)-1px)] before:hidden",
            variant === "straight" && "[--stack-step:0]",
            (position === "bottom" || position === "top") &&
              "h-(--drawer-height,auto) [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))] data-nested-drawer-open:h-(--height)",
            position === "bottom" &&
              "origin-[50%_calc(100%-var(--inset))] data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))]",
            position === "top" &&
              "origin-[50%_var(--inset)] data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--shrink)*var(--height))))_scale(var(--scale))]",
            position === "left" &&
              "origin-right data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)))_scale(var(--scale))]",
            position === "right" &&
              "origin-left data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)))_scale(var(--scale))]",
            className
          )}
          data-slot="drawer-popup"
          {...props}
        >
          {children}
          {showCloseButton && (
            <DrawerPrimitive.Close
              aria-label="Close"
              className="end-2 top-2 absolute"
              render={<Button size="icon" variant="ghost" />}
            >
              <XIcon />
            </DrawerPrimitive.Close>
          )}
          {showBar && <DrawerBar />}
        </DrawerPrimitive.Popup>
      </DrawerViewport>
    </DrawerPortal>
  )
}
