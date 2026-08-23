# corpora/ui — architecture

A shadcn-ready UI library for the corpora apps (manuscript & codex research),
plus its documentation site — in one Vite + React codebase.

## Two things live in `src/`

1. **The library** (published to npm as `@exegia/corpora-ui`, entry: `react/src/index.ts`)
2. **The docs site** (this Vite app, entry: `react/src/main.tsx`) — like
   ui.elevenlabs.io for audio, but for corpora's research UI.

```
src/
├── index.ts                  # npm library entry — exports all published components
├── main.tsx                  # docs site entry — ThemeProvider + RouterProvider
├── routes.tsx                # route tree, generated from registry categories
│
├── components/               # ── THE LIBRARY ──
│   ├── ui/                   # Atoms: primitives (button, input, text, …)
│   │                         #   = what `shadcn add` installs into consumer apps
│   ├── composed/             # Components: purposeful, unopinionated compositions
│   │                         #   (e.g. search field w/ prefix icon + clear button)
│   ├── blocks/               # Blocks: opinionated single-purpose assemblies
│   │                         #   (login, signup, navbar, sidebar, …)
│   ├── docs/                 # Docs-site-only widgets (preview shell, props table,
│   │                         #   code block) — NOT exported to npm
│   └── theme-provider.tsx    # Shared theme context
│
├── state/                    # ── SHARED STATE ──
│   ├── store.ts              # exegiaStore (module-level Jotai store)
│   ├── exegia-provider.tsx   # ExegiaProvider — the app's ONE provider
│   └── index.ts
│
├── registry/                 # ── SINGLE SOURCE OF TRUTH for the docs ──
│   ├── schema.ts             # RegistryEntry / CategoryDef / PropDef types
│   ├── atoms.ts              # one metadata entry per atom
│   ├── components.ts         # one metadata entry per component
│   ├── blocks.ts             # one metadata entry per block
│   ├── demos/                # lazy-loaded preview demos (one file per entry)
│   └── index.ts              # categories, lookups (getCategory/getEntries/getEntry)
│
├── layouts/
│   ├── site-layout.tsx       # header + top nav, wraps every page
│   └── docs-layout.tsx       # registry-driven sidebar, wraps docs pages
│
├── pages/
│   ├── home.tsx              # category grid + install snippet
│   ├── category-index.tsx    # shared list page (atoms/components/blocks)
│   ├── entry-detail.tsx      # shared detail page (Preview / Props / Usage)
│   └── not-found.tsx
│
└── lib/utils.ts              # cn() etc.
```

## Routes

| Path                | Page           |
| ------------------- | -------------- |
| `/`                 | Home           |
| `/atoms`            | Category index |
| `/atoms/:slug`      | Entry detail   |
| `/components`       | Category index |
| `/components/:slug` | Entry detail   |
| `/blocks`           | Category index |
| `/blocks/:slug`     | Entry detail   |
| `*`                 | Not found      |

Routes are generated in `routes.tsx` by iterating `registry/index.ts`
categories — adding a category never touches the router by hand.

## Adding a new component (the workflow)

1. Implement it in `src/components/ui|composed|blocks/<name>.tsx`.
1b. If it holds state, put it in Jotai atom families in
   `<name>-atom.ts` keyed by an instance id — never a new provider. See
   the State section of `CLAUDE.md`.
2. Export it from `src/index.ts` (npm surface).
3. Add a demo in `src/registry/demos/<name>-demo.tsx`.
4. Register it in `src/registry/{atoms,components,blocks}.ts` with slug, name,
   description, `preview`, `props` and `usage`.

That single registry entry produces: the homepage grid tile, the sidebar link,
the category card, and the detail page (`/category/<slug>`) with preview,
props table and usage snippet.

## Publishing (later)

- **npm**: build `src/index.ts` in Vite library mode (config to be added when
  the first components stabilize; externalize react/react-dom).
- **shadcn registry**: the registry files mirror the shadcn `registry.json`
  item shape (slug = registry name, `registryDependencies`), so generating
  `registry.json` for `bunx shadcn add @exegia/corpora-ui/<name>` is a mechanical step.
- **SPA hosting**: client-side routing needs a catch-all rewrite to
  `index.html` on the host (Vite dev/preview handle it automatically).
