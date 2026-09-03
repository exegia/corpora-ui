/**
 * Per-layer opacity shorthands for the inset-bezel family defined in index.css.
 *
 * `inset-shadow-lit/20` dims the whole lit layer without touching its edges;
 * `inset-shadow-dim/40` does the same for the shading layer. Tailwind's
 * CSS-first `@utility` cannot express this shape — a functional utility never
 * matches a bare root, and a static one never receives the `/…` modifier — so
 * these two utilities live here instead of alongside the rest of the family.
 */
export default function insetShadowLayerOpacity({ matchUtilities }) {
  for (const layer of ["lit", "dim"]) {
    matchUtilities(
      {
        [`inset-shadow-${layer}`]: (value, { modifier }) => ({
          // Pull in the shared box-shadow so the class stands on its own.
          "@apply inset-shadow-bezel": {},
          [`--inset-shadow-${layer}-alpha`]: modifier ?? value,
        }),
      },
      { values: { DEFAULT: "100" }, modifiers: "any" }
    )
  }
}
