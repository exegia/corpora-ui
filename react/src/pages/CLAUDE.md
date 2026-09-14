---
name: Fumapress pages
description: Rules for Fumapress file-based routes.
---

# Fumapress pages

## Purpose

- Fumapress loads route files from this folder.
- These files own routing only, not component implementation.
- Markdown pages in `docs/content` own the root `/` page.

## Key files

- `[category].tsx` renders a registry category.
- `[category]/[slug].tsx` renders an entry detail page.

## Commands

- `bun run build:docs` validates static paths.

## Gotchas

- Keep route files thin: export the default page and optional `getConfig()`.
- `getConfig()` derives static paths from `@/registry`.
- The `getConfig()` exports use a local React-refresh lint exception.
- Fumapress requires this folder under `src/`; do not move it to `docs/`.
