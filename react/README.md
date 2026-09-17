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
- `src/registry` — shared Story factory and worked demos
- `content` — Fumapress Markdown/MDX documentation and navigation
- `src/pages` — custom React routes only

## Adding a component

1. Implement it in the appropriate `ui`, `composed`, or `blocks` directory.
2. Export it from `src/index.ts`.
3. Add `src/components/stories/<name>.story.tsx` with `defineStory` from `@/registry/story`.
4. Write a page in `content/{atoms,composed,blocks}` and render
   `<Preview />` from MDX. Keep usage and prop notes in that page.
5. Add the slug to its category’s `meta.json`.

Fumapress provides the page layout, navigation, and Markdown rendering.
Story generates preview controls from the component’s TypeScript props.

## Pull a coss component

```bash
bunx shadcn@latest add @coss/<name> --yes
```

Adapt the imported component to the local token and API conventions.
