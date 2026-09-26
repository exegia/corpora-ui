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
bun run dev:example  # React consumer on http://127.0.0.1:3001
bun run check:consumer # pack + isolated consumer typecheck/production build
```

## Project layout

`react/` is the Bun workspace root. `examples/consumer` has its own private
manifest and shares version definitions through the root catalog. Use one
`bun install` here; do not install dependencies at the repository root.
See [the consumer example](examples/consumer/README.md) for development and
tarball verification.

Focused imports are available from `@exegia/corpora-ui/button`, `/card`,
`/input`, `/label`, `/state`, `/overlays`, `/shell`, and `/scaffold`.
Existing root imports continue to work. The consumer example loads its
Shell/Scaffold reading workspace on demand using those focused layout exports.
Import `@exegia/corpora-ui/index.css` once for either style. The library builds
all entrypoints together, sharing component implementations and state.

Mount `ExegiaProvider` once for toast, shared tooltip settings, and portal
defaults. Pass `store={appStore}` to share arbitrary app atoms with library
state. Existing Shell/Scaffold panel and drawer layout contexts stay local.
See [getting started](content/getting-started.mdx) for the provider contract.

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
