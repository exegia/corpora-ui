import type { GlassOptics } from "@samasante/liquid-glass"

export type TFrostGlassVariant = "clear" | "frosted" | "subtle" | "liquid" | "liquid-refract"
export type TFrostGlassVariantProp = { glassVariant?: TFrostGlassVariant }
export const liquidRefractStyles = "bg-transparent border-0 shadow-none"

/** Tints only; refraction, frost, and edge lighting belong to the library. */
export const glassVariantStyles: Record<TFrostGlassVariant, string> = {
  clear: "bg-white/25 dark:bg-black/25",
  frosted: "bg-white/55 dark:bg-black/35",
  subtle: "bg-white/30 dark:bg-white/6",
  liquid: "bg-white/10 dark:bg-white/4",
  "liquid-refract": "bg-white/8 dark:bg-white/4",
}

export const glassVariantOptics: Record<TFrostGlassVariant, Partial<GlassOptics>> = {
  clear: { frost: 2, saturate: 1.9, strength: 0.08 },
  frosted: { frost: 16, saturate: 1.6, strength: 0.08 },
  subtle: { frost: 4, saturate: 1.5, strength: 0.04 },
  liquid: { frost: 4, saturate: 1.8, strength: 0.14 },
  "liquid-refract": { frost: 2, saturate: 1.5, strength: 0.14 },
}
