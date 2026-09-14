# corpora/ui — architecture

A shadcn-ready UI library for the corpora apps, plus a Fumapress
documentation site built on Fumadocs.

## Layout

The project has two roots under `react/`.

- `src/` is the published component library and executable docs surface.
- `docs/` is the Fumapress prose and story content root.

```text
react/
├── docs/
│   ├── content/   # Markdown and MDX pages at the site root
│   └── stories/   # Interactive story playgrounds
│
├── src/
│   ├── components/
│   │   ├── ui/          # Atoms
│   │   ├── composed/    # Components
│   │   ├── blocks/      # Blocks
│   │   ├── docs/        # Docs-site-only widgets
│   │   └── icons/       # Icon atoms
│   ├── lib/             # Hooks, state, and utilities
│   ├── pages/           # Fumapress file-based routes
│   ├── registry/        # Docs metadata and lazy demos
│   └── app.css          # Global Fumapress styles
│
├── press.config.tsx     # Fumapress configuration
└── vite.config.ts       # Fumapress, MDX, Tailwind, Story
```

## Fumapress configuration

`press.config.tsx` is the site’s single source of truth.

- It sets an absolute `site.baseUrl` so sitemap, RSS, Open Graph, and
  canonical links are not relative.
- Local builds use `http://localhost:3000`; set `SITE_URL` for production
  or CI.
- Vite serves the site from `/`.
- `press.config.tsx` loads `docs/content` and mounts it at the site root.
- Only `.mdx` files in `docs/content` become docs pages.

## Source layers

- `src/components/ui` — atoms.
- `src/components/composed` — components.
- `src/components/blocks` — blocks.
- `src/components/docs` — docs-site-only widgets.
- `src/lib` — hooks, state, and utilities.
- `src/registry` — docs metadata and lazy demos.

## Routes

| Path | Page |
| ---- | ---- |
| `/` | Fumapress documentation overview |
| `/getting-started` | Getting started |
| `/architecture` | Architecture |
| `/story` | Story |
| `/atoms` | Atoms category |
| `/atoms/:slug` | Atom detail |
| `/composed` | Composed category |
| `/composed/:slug` | Composed detail |
| `/blocks` | Blocks category |
| `/blocks/:slug` | Block detail |
| `*` | Not found |

## Docs workflow

1. Add prose under `docs/content`.
2. Add registry metadata under `src/registry`.
3. Add a lazy demo under `src/registry/demos`.
4. Build with `bun run build:docs`.
