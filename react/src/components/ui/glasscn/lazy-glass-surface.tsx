"use client"

import { lazy, Suspense, type ComponentType } from "react"
import {
  glassVariantOptics,
  glassVariantStyles,
  type TFrostGlassVariant,
} from "@/lib/glass-variants"
import { cn } from "@/lib/utils"

type Props = { glassVariant: TFrostGlassVariant }

// Keep the decorative surface visible without suspending the button itself.
// This also remains usable if the optional chunk cannot be downloaded.
function GlassFallback({ glassVariant }: Props) {
  return (
    <span
      aria-hidden="true"
      data-glass-fallback=""
      className={cn("pointer-events-none", glassVariantStyles[glassVariant])}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        zIndex: -1,
        backdropFilter: `blur(${glassVariantOptics[glassVariant].frost}px)`,
      }}
    />
  )
}

const GlassSurface = lazy<ComponentType<Props>>(() =>
  import("./liquid-glass")
    .then(({ GlassSurface }) => ({ default: GlassSurface }))
    .catch(() => ({ default: GlassFallback }))
)

export function LazyGlassSurface(props: Props) {
  return (
    <Suspense fallback={<GlassFallback {...props} />}>
      <GlassSurface {...props} />
    </Suspense>
  )
}
