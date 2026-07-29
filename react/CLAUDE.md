# corpora-ui — react

Vite + React 19 + Tailwind v4 + shadcn (base-ui, style "base-mira"). Library
source in `src/components/{ui,composed,blocks}`, docs site driven by
`src/registry/`. See `ARCHITECTURE.md` for the full layout. Node dependencies
are installed HERE (`cd react && bun add <pkg>`), never at the repo root. Verify with
`make check` (runs `tsc -b --noEmit` + eslint) — plain `tsc --noEmit` checks
nothing here (references-only root tsconfig).

## Interaction sound (cuelume)

Components emit inert `data-cuelume-*` attributes (Button: press/release,
gated by its `sound` prop, default true). Nothing plays until an app calls
`bindSounds()` (re-exported from `src/lib/sound.ts`; the docs site does this
in `main.tsx`). Never call `bind()` at library-module scope — opting into
sound is the consumer's decision. Pick sound names from cuelume's palette by
suggested use (`toggle` for switches/tabs, `success`/`error` for outcomes,
`tick` for nav hover).

## Glass variants

Glass is NOT a separate component family — it is a `variant="glass"` on the
base component, with a `glassVariant` prop selecting the finish. The system
has three parts:

- `src/lib/glass-variants.ts` — `FrostGlassVariant` type + `glassVariantStyles`
  (one Tailwind class string per finish) + `liquidRefractStyles`.
- `src/components/ui/glasscn/` — glass-only machinery. `liquid-glass.tsx` is
  the SVG-displacement backdrop wrapper used by the `liquid-refract` finish.
- The base component (`ui/button.tsx` is the reference implementation).

### Pattern for adding glass to a base component

Follow `ui/button.tsx` exactly:

1. Add `glass` to the component's cva `variant` map with a **neutral base**
   (`border-transparent text-foreground` + slot text colors). The finish
   styling never lives in the cva — it comes from `glassVariantStyles`.
2. Type-gate the finish with a discriminated union — `glassVariant` must only
   be accepted when `variant` is `"glass"`:
   ```ts
   type Props = BaseProps &
     (
       | { variant: "glass"; glassVariant?: FrostGlassVariant }
       | { variant?: Exclude<Variant, "glass">; glassVariant?: never }
     );
   ```
3. Default finish is `"liquid-refract"`. Resolve it only when
   `variant === "glass"`; otherwise it stays `undefined`.
4. Compose the className as:
   `cn(cvaVariants({ size, variant }), glassVariantStyles[finish], isLiquidRefract && liquidRefractStyles, className)`.
5. `liquid-refract` additionally wraps the rendered element in
   `<LiquidGlass>` (import from `ui/glasscn/liquid-glass`). All other
   finishes are pure classes.
6. Emit `data-glass-variant={finish}` on the element.
7. Never touch the `size` axis or other variants — glass composes with all
   existing sizes.
8. Update the component's entry in `src/registry/` (props table: `variant`
   list + `glassVariant` row).

### Adding a new finish

Extend the `FrostGlassVariant` union and add a `glassVariantStyles` entry in
`glass-variants.ts` — every consumer picks it up automatically. Finishes that
need runtime machinery (like `liquid-refract`, whose entry is `""`) get their
wrapper in `ui/glasscn/` and an explicit branch in the base component.

### Do not

- Do not create new `Glass<X>` wrapper components. `glasscn/glass-button.tsx`
  is a deprecated back-compat shim only — new work uses `variant="glass"`.
- Do not gate `glassVariant` at runtime only; the union type is the contract.
  Verify with a scratch file: `<X glassVariant="frosted">` without
  `variant="glass"` must fail `tsc -b --noEmit`.

### Gotchas

- `LiquidGlass` refraction is Chromium-only (UA-gated); other browsers get a
  blur/saturate fallback. It defaults to `rounded-full` and reads only
  `borderTopLeftRadius` in px for its displacement map.
- `glassVariantStyles` strings override the cva base via tailwind-merge order
  (they are passed after the cva output in `cn`), e.g. finish borders win
  over `border-transparent`.
