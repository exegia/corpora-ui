"use client"

import { Glass, type GlassOptics } from "@samasante/liquid-glass"
import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { glassVariantOptics, glassVariantStyles, type TFrostGlassVariant } from "@/lib/glass-variants"

/** A non-interactive material layer: the host keeps its semantics and layout. */
export function GlassSurface({
  glassVariant = "liquid-refract",
  optics,
}: {
  glassVariant?: TFrostGlassVariant
  optics?: Partial<GlassOptics>
}) {
  return (
    <Glass
      aria-hidden="true"
      data-glass-material="samasante"
      className={cn("pointer-events-none", glassVariantStyles[glassVariant])}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "inherit", zIndex: -1 }}
      optics={{ ...glassVariantOptics[glassVariant], ...optics }}
    >
      <span />
    </Glass>
  )
}

export type TLiquidGlassProps = HTMLAttributes<HTMLDivElement> & {
  glassVariant?: TFrostGlassVariant
  optics?: Partial<GlassOptics>
  blur?: number
  refraction?: number
  /** @deprecated The library manages displacement map resolution. */
  mapSize?: number
  bezel?: number
  saturation?: number
}

/** Compatibility adapter for existing consumers; all optics run in the library. */
export const LiquidGlass = forwardRef<HTMLDivElement, TLiquidGlassProps>(
  function LiquidGlass({
    glassVariant = "liquid-refract", optics, blur, refraction,
    mapSize: _mapSize, bezel, saturation, className, children, ...props
  }, ref) {
    return (
      <div ref={ref} className={cn("relative isolate rounded-full", className)} {...props}>
        <GlassSurface glassVariant={glassVariant} optics={{
          ...(blur !== undefined && { frost: Math.max(0, blur) }),
          ...(refraction !== undefined && { strength: Math.min(1, Math.max(0, refraction / 100)) }),
          ...(bezel !== undefined && { bendWidth: Math.min(1, Math.max(0, bezel / 100)) }),
          ...(saturation !== undefined && { saturate: Math.max(0, saturation) }),
          ...optics,
        }} />
        {children}
      </div>
    )
  }
)
