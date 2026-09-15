---
name: Fumapress site docs
description: Ownership rules for the Fumapress documentation site root.
---

# Fumapress site docs

## Purpose

- This folder is the Fumapress docs root used by `press.config.tsx`.
- It owns prose content and story playgrounds.
- Route shells and registry code belong in `src/pages` and `src/registry`.

## Key files

- `content/` holds Markdown and MDX pages at the site root.
- `stories/` holds interactive story files.

## Commands

- `bun run build:docs` validates the site from `react/`.

## Gotchas

- Do not move this tree without updating `press.config.tsx`.
- Keep executable route and registry code under `src/`.
