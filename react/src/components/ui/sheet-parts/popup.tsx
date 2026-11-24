"use client"

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import SheetPortal from "./portal"
import SheetBackdrop from "./backdrop"
import SheetViewport from "./viewport"

export default function SheetPopup({
  className,
  children,
  showCloseButton = true,
  showBackdrop = true,
  side = "right",
  variant = "default",
  closeProps,
  portalProps,
  ...props
}: SheetPrimitive.Popup.Props & {
  showCloseButton?: boolean
  showBackdrop?: boolean
  side?: "right" | "left" | "top" | "bottom"
  variant?: "default" | "inset"
  closeProps?: SheetPrimitive.Close.Props
  portalProps?: SheetPrimitive.Portal.Props
}): React.ReactElement {
  return (
    <SheetPortal {...portalProps}>
      {showBackdrop && <SheetBackdrop />}
      <SheetViewport side={side} variant={variant}>
        <SheetPrimitive.Popup
          className={cn(
            "min-h-0 min-w-0 shadow-lg/5 before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] max-sm:before:hidden dark:before:shadow-[0_-1px_--theme(--color-white/6%)] relative flex max-h-full w-full flex-col bg-popover text-popover-foreground transition-[opacity,translate] duration-200 ease-in-out will-change-transform not-dark:bg-clip-padding before:pointer-events-none before:absolute data-ending-style:opacity-0 data-starting-style:opacity-0",
            side === "bottom" &&
              "data-ending-style:translate-y-8 data-starting-style:translate-y-8 row-start-2 border-t",
            side === "top" &&
              "data-ending-style:-translate-y-8 data-starting-style:-translate-y-8 border-b",
            side === "left" &&
              "w-[calc(100%-(--spacing(12)))] max-w-md data-ending-style:-translate-x-8 data-starting-style:-translate-x-8 border-e",
            side === "right" &&
              "w-[calc(100%-(--spacing(12)))] max-w-md data-ending-style:translate-x-8 data-starting-style:translate-x-8 col-start-2 border-s",
            variant === "inset" &&
              "sm:rounded-2xl sm:border sm:before:rounded-[calc(var(--radius-2xl)-1px)] sm:**:data-[slot=sheet-footer]:rounded-b-[calc(var(--radius-2xl)-1px)] before:hidden",
            className
          )}
          data-slot="sheet-popup"
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close
              aria-label="Close"
              className="inset-e-2 top-2 absolute"
              render={<Button size="icon" variant="ghost" />}
              {...closeProps}
            >
              <XIcon />
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Popup>
      </SheetViewport>
    </SheetPortal>
  )
}
