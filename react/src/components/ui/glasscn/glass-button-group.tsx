"use client"

import {
  type TFrostGlassVariantProp,
} from "@/lib/glass-variants"
import { cn } from "@/lib/utils"

import { ButtonGroup } from "../button-group"
import { GlassSurface } from "./liquid-glass"

type TGlassButtonGroupProps = Omit<React.ComponentProps<typeof ButtonGroup>, "children"> & { children?: React.ReactNode } &
  TFrostGlassVariantProp

function GlassButtonGroup({
  className,
  glassVariant = "liquid-refract",
  children,
  ...props
}: TGlassButtonGroupProps) {

  return (
    <ButtonGroup
      data-slot="glass-button-group"
      data-glass-variant={glassVariant}
      className={cn("relative isolate rounded-lg", className)}
      {...props}
    >
      <GlassSurface glassVariant={glassVariant} />
      {children}
    </ButtonGroup>
  )
}

export { GlassButtonGroup }
