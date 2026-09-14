---
name: Fumapress content
description: Rules for Markdown and MDX documentation pages.
---

# Fumapress content

## Purpose

- This folder is the docs prose and MDX source loaded by `press.config.tsx`.
- Pages mount at the site root, not under `/docs`.

## Key files

- One `.md` or `.mdx` file is one docs page.
- `index.mdx` owns `/`.
- `meta.json` controls navigation order.

## Commands

- `bun run build:docs` validates the site from `react/`.

## Gotchas

- Keep documentation prose and MDX usage here.
- Keep route logic and docs-site widgets outside this folder.
- Import site components through the `@/` alias.
- Keep instruction files outside `content/`; all Markdown files there are published pages.
