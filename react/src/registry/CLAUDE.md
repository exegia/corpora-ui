---
name: Documentation examples
description: Worked demos and the shared Fumadocs Story factory.
---

# Documentation examples

- Documentation lives in `content/` as Markdown and MDX.
- `story.ts` exports the shared `defineStory` factory.
- Component `*.story.tsx` files live beside library components.
- `demos/` holds larger worked examples imported directly by MDX.
- Interactive demos start with `"use client"`.
- `browser/` holds preview presentation helpers.

Run `bun run build:docs` to validate content and story rendering.
