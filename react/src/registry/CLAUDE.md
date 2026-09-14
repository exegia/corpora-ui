---
name: Docs registry
description: Rules for docs metadata and lazy demos.
---

# Docs registry

## Purpose

- This folder owns docs-site metadata and lazy demos, not library source.

## Key files

- `schema.ts` defines entry and category types.
- `index.ts` owns categories and lookups.
- `atoms.ts`, `components.ts`, and `blocks.ts` hold entries.
- `demos/` holds one lazy demo per documented component.

## Commands

- `bun run build:docs` validates registry-driven static paths.

## Gotchas

- Add each new entry to its matching category array.
- Every interactive demo starts with `"use client"`.
- Keep demo-only presentation wrappers under `src/components/docs`.
- Registry slugs are public docs URLs.
