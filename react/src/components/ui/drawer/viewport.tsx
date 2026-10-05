"use client"

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import type React from "react"
import { cn } from "@/lib/utils"
import type { DrawerPosition } from "./type"

export default function DrawerViewport({
  className,
  position,
  variant = "default",
  ...props
}: DrawerPrimitive.Viewport.Props & {
  position?: DrawerPosition
  variant?: "default" | "straight" | "inset"
}): React.ReactElement {
  return (
    <DrawerPrimitive.Viewport
      className={cn(
        "inset-0 [--bleed:--spacing(12)] [--inset:--spacing(0)] fixed z-50",
        "touch-none",
        position === "bottom" && "pt-12 grid grid-rows-[1fr_auto]",
        position === "top" && "pb-12 grid grid-rows-[auto_1fr]",
        position === "left" && "flex justify-start",
        position === "right" && "flex justify-end",
        variant === "inset" && "sm:[--inset:--spacing(4)] px-(--inset)",
        variant === "inset" && position !== "bottom" && "pt-(--inset)",
        variant === "inset" && position !== "top" && "pb-(--inset)",
        className
      )}
      data-slot="drawer-viewport"
      {...props}
    />
  )
}
