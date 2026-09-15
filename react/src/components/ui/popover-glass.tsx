"use client"

import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import type React from "react"
import { type FrostGlassVariant } from "@/lib/glass-variants"
import { cn } from "@/lib/utils"
import { GlassContainer } from "@/components/ui/glasscn/glass-container"

/** Layout, sizing and transition — shared by every popup variant. */
const popupStructuralClasses =
  "relative flex h-(--popup-height,auto) w-(--popup-width,auto) origin-(--transform-origin) outline-none transition-[width,height,scale,opacity] has-data-[slot=calendar]:rounded-xl data-starting-style:scale-98 data-starting-style:opacity-0"

/**
 * Neutral base for the glass treatment — the finish itself (blur, tint,
 * bevel) comes from `glassVariantStyles` keyed by `glassVariant`, which is
 * only accepted when `variant` is "glass".
 */
const popupGlassBaseClasses =
  "border-transparent! text-foreground bg-transparent!"

/**
 * Every finish except "liquid-refract". That one delegates its look to the
 * `LiquidGlass` wrapper, whose `overflow-hidden` box measures 0px tall around
 * an absolutely-sized popup and clips it away entirely — so a popup offers the
 * four pure-class finishes only, and defaults to "frosted" rather than to
 * Button's "liquid-refract".
 */
type PopoverGlassVariant = Exclude<FrostGlassVariant, "liquid-refract">

export const PopoverCreateHandle: typeof PopoverPrimitive.createHandle =
  PopoverPrimitive.createHandle

export const Popover: typeof PopoverPrimitive.Root = PopoverPrimitive.Root

export function PopoverTrigger({
  className,
  children,
  ...props
}: PopoverPrimitive.Trigger.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Trigger
      className={className}
      data-slot="popover-trigger"
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  )
}

type PopoverPopupBaseProps = PopoverPrimitive.Popup.Props & {
  portalProps?: PopoverPrimitive.Portal.Props
  side?: PopoverPrimitive.Positioner.Props["side"]
  align?: PopoverPrimitive.Positioner.Props["align"]
  sideOffset?: PopoverPrimitive.Positioner.Props["sideOffset"]
  alignOffset?: PopoverPrimitive.Positioner.Props["alignOffset"]
  tooltipStyle?: boolean
  anchor?: PopoverPrimitive.Positioner.Props["anchor"]
}

export type PopoverGlassProps = PopoverPopupBaseProps & {
  /** Glass finish. Either "frosted" or "glass". Defaults to "frosted". */
  glassVariant?: PopoverGlassVariant
}

export function PopoverGlass({
  children,
  className,
  side = "bottom",
  align = "center",
  sideOffset = 0,
  alignOffset = 0,
  anchor,
  portalProps,
  glassVariant,
  ...props
}: PopoverGlassProps): React.ReactElement {
  const resolvedGlassVariant: PopoverGlassVariant = glassVariant ?? "frosted"

  return (
    <PopoverPrimitive.Portal {...portalProps} keepMounted>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] animate-bezier-sine-in-out animate-duration-fast data-instant:transition-none"
        data-slot="popover-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          className={cn(
            popupStructuralClasses,
            popupGlassBaseClasses,
            className
          )}

          data-glass-variant={resolvedGlassVariant}
          data-slot="popover-popup"
          {...props}
        >
          <PopoverPrimitive.Arrow  className="relative block w-2.5 h-2 overflow-clip transition-[left] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-[calc(6px*sqrt(2))] before:h-[calc(6px*sqrt(2))] before:bg-background/80 before:[transform:translate(-50%,50%)_rotate(45deg)]" />
          
          <PopoverPrimitive.Viewport
            className={cn(
              "relative size-full max-h-(--available-height) px-(--viewport-inline-padding) [--viewport-inline-padding:--spacing(4)] has-data-[slot=calendar]:p-2 **:data-current:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding)-2px)] **:data-current:opacity-100 **:data-current:transition-opacity **:data-current:data-ending-style:opacity-0 data-instant:transition-none **:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding)-2px)] **:data-previous:opacity-100 **:data-previous:transition-opacity **:data-previous:data-ending-style:opacity-0 **:data-current:data-starting-style:opacity-0 **:data-previous:data-starting-style:opacity-0",
              "bg-background/40 px-0 backdrop-blur-md"
            )}
            data-slot="popover-viewport"
            render={
              <GlassContainer
                refraction={8}
                bezel={50}
                blur={10}
                saturation={-4}
                className={cn("shadow-md shadow-black/10 rounded-lg")}
                glassVariant="liquid-refract"
              />
            }
          >
            {children}
          </PopoverPrimitive.Viewport>
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export function PopoverClose({
  ...props
}: PopoverPrimitive.Close.Props): React.ReactElement {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

export function PopoverTitle({
  className,
  ...props
}: PopoverPrimitive.Title.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Title
      className={cn("text-lg leading-none font-semibold", className)}
      data-slot="popover-title"
      {...props}
    />
  )
}

export function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="popover-description"
      {...props}
    />
  )
}

export { PopoverPrimitive, PopoverGlass as PopoverContent }
