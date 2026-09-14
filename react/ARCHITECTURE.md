# corpora/ui — architecture

A shadcn-ready UI library for the corpora apps (manuscript & codex research),
plus a Fumapress documentation site built on Fumadocs.

## Two things live in `src/`

1. **The library** (published to npm as `@exegia/corpora-ui`, entry: `react/src/index.ts`)
2. **The docs site** (Fumapress, config: `react/press.config.tsx`) — Markdown
   documentation plus live, registry-driven component pages.

```
src/
├── index.ts                  # npm library entry — exports all published components
├── app.css                   # Fumapress + Fumadocs global styles
├── pages/                    # Fumapress file-based routes
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
├── components/docs/pages/     # client page implementations used by the routes
│
└── lib/utils.ts              # cn() etc.
```

Fumapress also uses:

- `content/docs/` — Markdown documentation under `/docs`
- `press.config.tsx` — content source, site metadata, and layout defaults
- `vite.config.ts` — Fumapress, MDX, Tailwind, and `@` alias plugins

## Routes

| Path              | Page           |
| ----------------- | -------------- |
| `/`               | Home           |
| `/atoms`          | Category index |
| `/atoms/:slug`    | Entry detail   |
| `/composed`       | Category index |
| `/composed/:slug` | Entry detail   |
| `/blocks`         | Category index |
| `/blocks/:slug`   | Entry detail   |
| `*`               | Not found      |

File-based routes live in `src/pages`. The category and component paths are
generated from `registry/index.ts`, so adding a category or registry entry does
not require another hand-written route.

## Adding a new component (the workflow)

1. Implement it in `src/components/ui|composed|blocks/<name>.tsx`.
   1b. If it holds state, put it in Jotai atom families in
   `<name>-atom.ts` keyed by an instance id — never a new provider. See
   the State section of `CLAUDE.md`.
2. Export it from `src/index.ts` (npm surface).
3. Add a demo in `src/registry/demos/<name>-demo.tsx`.
4. Register it in `src/registry/{atoms,components,blocks}.ts` with slug, name,
   description, `preview`, `props` and `usage`.

That single registry entry produces the category card and the detail page with
preview, props table, usage snippet, and examples.

## Publishing (later)

- **npm**: build `src/index.ts` in Vite library mode (config to be added when
  the first components stabilize; externalize react/react-dom).
- **shadcn registry**: the registry files mirror the shadcn `registry.json`
  item shape (slug = registry name, `registryDependencies`), so generating
  `registry.json` for `bunx shadcn add @exegia/corpora-ui/<name>` is a mechanical step.
- **Documentation hosting**: Fumapress builds both static HTML and the server
  bundle needed for its default search and content routes.
