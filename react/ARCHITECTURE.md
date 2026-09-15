# corpora/ui — architecture

A React component library with a Fumapress documentation site.

## Layout

```text
react/
├── content/              # Markdown/MDX documentation and navigation metadata
│   ├── atoms/
│   ├── composed/
│   └── blocks/
├── src/
│   ├── components/       # Library components and adjacent *.story.tsx files
│   ├── lib/              # Hooks, state, and utilities
│   ├── pages/            # Custom React routes only, when needed
│   ├── registry/
│   │   ├── demos/        # Worked examples imported by MDX
│   │   └── story.ts      # Shared Fumadocs Story factory
│   └── app.css           # Fumapress and Story styles
├── press.config.tsx      # Content source, layout, and site configuration
└── vite.config.ts        # Fumapress, MDX, Tailwind, and Story plugins
```

## Documentation

Fumapress maps `.md` and `.mdx` files in `content/` directly to URLs.
`content/index.mdx` serves `/`; `content/atoms/button.mdx` serves
`/atoms/button`. Frontmatter owns titles and descriptions. `meta.json`
files set sidebar order. Reserve `src/pages` for custom designs.

Component stories live beside their components and import `defineStory`
from `@/registry/story`. Stories export `Preview = story.WithControl` from a `"use client"` module.
MDX imports that preview component and renders
`<Preview />` for a preview and TypeScript-derived prop controls.
Detailed examples reuse `src/registry/demos` where useful. Usage snippets
and explanatory prop notes live in MDX, with no parallel TypeScript
registry to update.

## Workflow

1. Add or update a component and its adjacent `*.story.tsx` file.
2. Write its page in `content/atoms`, `content/composed`, or `content/blocks`.
3. Add the slug to the category's `meta.json`.
4. Run `make check`, `make test`, and `make build` from the repository root.

Set `SITE_URL` to the deployed site URL for production builds. Local builds
use `http://localhost:3000`.
