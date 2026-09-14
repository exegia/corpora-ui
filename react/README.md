# @exegia/corpora-ui

A React 19 + Tailwind v4 component library and Fumapress documentation site.

## Commands

```bash
bun install
bun run dev          # Fumapress docs site
bun run typecheck
bun run lint
bun test
bun run build        # docs site + publishable library
```

## Project layout

- `src/components/ui` — atoms
- `src/components/composed` — components
- `src/components/blocks` — blocks
- `src/registry` — component metadata, usage, props, and lazy demos
- `content/docs` — Fumapress Markdown documentation
- `src/pages` — Fumapress routes, including registry-driven component pages

## Adding a component

1. Implement it in the appropriate `ui`, `composed`, or `blocks` directory.
2. Export it from `src/index.ts`.
3. Add a lazy demo in `src/registry/demos`.
4. Register it in `src/registry/{atoms,components,blocks}.ts`.

The registry entry drives the category page, detail page, live preview, props
table, usage snippet, and examples.

## Pull a coss component

```bash
bunx shadcn@latest add @coss/<name> --yes
```

Adapt the imported component to the local token and API conventions.
