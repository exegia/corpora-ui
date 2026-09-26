# corpora/ui — architecture

A React component library with a Fumapress documentation site.

`react/` is also the Bun workspace root. The private `examples/consumer`
workspace imports the library's public package exports and built stylesheet.
Shared development versions live in `package.json`'s catalog; one `bun.lock`
covers the library, documentation tooling, and example. The library build uses
`vite.lib.config.ts` and `tsconfig.lib.json`; the docs keep `vite.config.ts`.
Run `bun run check:consumer` to test a packed tarball outside the workspace.

The library builds its root and focused `button`, `card`, `input`, `label`,
`state`, `overlays`, `shell`, and `scaffold` entrypoints together. Shared chunks keep module-level state and
component identity consistent across import paths. Explicit package exports
pair each JavaScript entry with its declaration file. CSS remains one explicit
`@exegia/corpora-ui/index.css` import. The consumer check guards export identity
and ensures focused imports exclude unrelated emoji dependencies and defer
layout motion until the example's workspace opens.

`src/library.css` scans component and library sources explicitly, excluding
docs, stories, and tests. It keeps the shared theme and component styles, but
does not import the docs' `tailwind-animations` preset: the glass popover uses
explicit animation values and the library preserves its existing pulse keyframes.
Keep the complete component source scan so npm consumers get styles for every
export, including components absent from the example app.

Base UI primitives are also available through `@exegia/corpora-ui/ui/<name>`
and the root `UI` namespace. Focused UI entries reuse the same implementations
as the existing root exports. The namespace keeps primitive `Avatar` and
`Sidebar` separate from the composed root components with those names. New
primitive compositions use one default component per file and named public
barrels. Configuration contexts (position, field id, size) remain local; the
sidebar's mutable state uses instance-keyed Jotai atoms in the shared store.


`ExegiaProvider` owns one Jotai store plus mandatory toast and tooltip
infrastructure. It provides a shared portal destination for modal, popover,
tooltip, and toast surfaces. `overlays` exports their composition primitives;
per-instance roots keep focus/trigger state local. Shell/Scaffold retain
their measurement/layout contexts and use the supplied store for panel and
drawer atoms. Consumer atoms need no registration or additional provider.

## Layout

```text
react/
├── content/              # Markdown/MDX documentation and navigation metadata
│   ├── atoms/
│   ├── composed/
│   └── blocks/
├── src/
│   ├── components/       # Library components and centralized stories/
│   ├── assets/css/        # Internal theme, base, shadow, and chat styles
│   ├── lib/              # Hooks, state, and utilities
│   ├── pages/            # Custom React routes only, when needed
│   ├── registry/
│   │   ├── demos/        # Worked examples imported by MDX
│   │   └── story.ts      # Shared Fumadocs Story factory
│   ├── index.css         # Public ordered stylesheet entrypoint
│   └── app.css           # Fumapress and Story styles
├── press.config.tsx      # Content source, layout, and site configuration
└── vite.config.ts        # Fumapress, MDX, Tailwind, and Story plugins
```

## Documentation

Fumapress maps `.md` and `.mdx` files in `content/` directly to URLs.
`content/index.mdx` serves `/`; `content/atoms/button.mdx` serves
`/atoms/button`. Frontmatter owns titles and descriptions. `meta.json`
files set sidebar order. Reserve `src/pages` for custom designs.

Atom, composed-component, and block stories live in `src/components/stories` and import `defineStory`
from `@/registry/story`. Stories export `Preview = story.WithControl` from a `"use client"` module.
MDX imports that preview component and renders
`<Preview />` for a preview and TypeScript-derived prop controls.
Detailed examples reuse `src/registry/demos` where useful. Usage snippets
and explanatory prop notes live in MDX, with no parallel TypeScript
registry to update.

## Workflow

1. Add or update a component and its `src/components/stories/*.story.tsx` file.
2. Write its page in `content/atoms`, `content/composed`, or `content/blocks`.
3. Add the slug to the category's `meta.json`.
4. Run `make check`, `make test`, and `make build` from the repository root.

Set `SITE_URL` to the deployed site URL for production builds. Local builds
use `http://localhost:3000`.
