# corpora-ui — react

Vite + React 19 + Tailwind v4 + shadcn (base-ui, style "base-mira"). Library
source in `src/components/{ui,composed,blocks}`, docs site driven by
`src/registry/`. See `ARCHITECTURE.md` for the full layout. Node dependencies
are installed HERE (`cd react && bun add <pkg>`), never at the repo root. Verify with
`make check` (runs `tsc -b --noEmit` + eslint) — plain `tsc --noEmit` checks
nothing here (references-only root tsconfig).

## Tests

`bun test` (run it from `react/`, not the repo root — `bunfig.toml` lives here
and carries the preload). `src/test/setup.ts` registers happy-dom and stubs
`matchMedia` + `Element.animate`, which motion needs; component tests use
`@testing-library/react`. Anything behind `MorphStep`/`Reveal` arrives on an
animation frame, so assert with `findBy*`, not `getBy*`. Base UI renders a
hidden native input beside its Checkbox root, so query checkboxes by role
rather than by label — `getByLabelText` matches both.

## State (one provider, Jotai atom families)

Stateful components keep state in module-level Jotai atom families keyed by an
instance id, NOT in a per-component React context. Consumers mount
`ExegiaProvider` once and every state hook works anywhere below it. Never add
a second provider to the public surface — that is the whole point of this
layer.

- `src/state/store.ts` — `exegiaStore` (module-level default) + `ExegiaStore`.
- `src/state/exegia-provider.tsx` — `ExegiaProvider` (jotai `Provider`, plus
  opt-in `sound` and `theme`) and `useExegiaStore`.
- `jotai` is a **peerDependency**: the library owns a store, so a consumer app
  that also uses Jotai must resolve the same module instance.
- Without the provider, hooks fall back to Jotai's implicit default store,
  which is not `exegiaStore` — imperative access would then read a different
  store than the components render from.

### Pattern for adding state to a component

`components/composed/tree/` is the reference implementation.

1. Types in `type.ts` — `<Feature>State`, `<Feature>Actions`, and `@internal`
   `<Feature>Config` / `<Feature>Handlers` / `<Feature>Seed`. No atom imports:
   `type.ts` stays dependency-free.
2. Atoms in `<feature>-atom.ts`. Use the in-house `keyed()` family, NOT
   `jotai/utils`' `atomFamily` (deprecated for Jotai v3), then the
   `stateFamily` / `readFamily` / `actionFamily` wrappers. Every atom carries
   a `debugLabel` of `<feature>/<id>/<name>`.
3. Mutations are write-only action atoms, never exported setters, so the app
   can drive a component by id without holding its controller.
4. `use-<feature>.ts` binds the atoms for the mounting component;
   `use-<feature>-state.ts` exposes `use<Feature>State(id)` (reads) and
   `use<Feature>Actions(id)` (writes only, so the caller never re-renders when
   the component changes).
5. The barrel exports public atoms explicitly. Never `export *` from the atom
   module — `@internal` atoms would become a breaking-change surface.
6. Unnamed instances key off `React.useId()` and are dropped on unmount; an
   explicit id outlives its component, so a rail's fold survives a route
   change. Call `remove<Feature>Instance(id)` on logout/teardown.

### Rows read per-node atoms, not the controller

A recursive component must not pull its state off a context value that carries
the whole controller — every row then re-renders on every toggle. Instead:

- `nodeFamily()` in `<feature>-atom.ts` builds atoms keyed by tree **and** node
  (`treeNodeExpandedAtom(treeId, nodeId)`, `treeNodeActiveAtom`, …). A row
  subscribes to its own booleans and sits still when a sibling's change.
- The context value carries only `treeId`, render props and the **stable** drag
  handlers (`useTreeDndHandlers`), so it never changes identity. Drag handlers
  read `draggedId`/`dropTarget` out of the store when they run rather than
  closing over them — that is what keeps them stable.
- The row component is wrapped in `React.memo`, so a root re-render (a rail
  measurement, a new `renderTrailing`) does not walk the tree.

`tree-atom.test.tsx` guards this by counting `renderTrailing` calls per node:
expanding one branch must leave its sibling's count unchanged. That test fails
if the memo or the per-node subscriptions are removed.

### The controlled-prop rule that bites

Controlled props stay the source of truth. The hook projects them into the
atoms in a layout effect so action atoms and remote readers see current data —
a one-way projection, not a second source of truth, with write gates
(`controlsItems`, `controlsActiveId`, …) keeping the store from overwriting a
prop.

A hook must NEVER subscribe to an atom it also writes from a prop of unstable
identity. An inline `items={[…]}` array is a new reference every render, so
that round-trip is an infinite loop. `treeOwnedItemsAtom` is the guard: it
reads empty while a controlled prop owns the data, so the projection write
notifies remote readers only, never the hook that produced it. Primitive props
(`activeId`, `collapsed`) need no guard — the effect deps settle on their own.

## Pulling coss components

`components.json` maps the `@coss` registry (coss.com/ui). Install base
components with `bunx shadcn add @coss/<name> --yes` (never `--overwrite` —
our button/atoms carry local customizations). Copy-paste patterns come from
coss "particles" (`https://coss.com/ui/r/p-<type>-<n>.json`) via the
coss-particles skill; adapt imports to `@/components/ui/*`. Auth blocks in
`src/components/blocks/auth/` share `auth-shell.tsx` (AuthCard, MorphStep,
AuthError shake, AuthSuccess check, useCountdown) — new multi-state blocks
should reuse it, with `motion/react` for step morphs.

## Interaction sound (cuelume)

Components emit inert `data-cuelume-*` attributes (Button: press/release,
gated by its `sound` prop, default true). Nothing plays until an app calls
`bindSounds()` (re-exported from `src/lib/sound.ts`; the docs site does this
in `main.tsx`). Never call `bind()` at library-module scope — opting into
sound is the consumer's decision. For keyboard-driven cues the attributes
can't cover (OTP typing, visibility toggles), use `playCue()` from
`lib/sound.ts` — it no-ops until bindSounds() has run; never call cuelume's
raw `play()` from a component. Every sounded component takes a
`sound?: boolean` prop (default true). Pick names from cuelume's palette by
suggested use (`toggle` for switches/tabs, `success`/`error` for outcomes,
`tick` for nav hover/typing, `bloom`/`droplet` for reveal/dismiss).

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
