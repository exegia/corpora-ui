import type { TitleStyleType } from "@/components/beste/piece/type"
import type * as React from "react"

/**
 * The three abstraction levels of the library.
 *
 * - `atoms`      — lowest-level primitives (button, input, icon, text, …).
 *                  Source of truth lives in `src/components/ui` (shadcn `registry:ui`).
 * - `components` — purposeful compositions that stay unopinionated
 *                  (e.g. search field with prefix icon + clear button).
 *                  Source lives in `src/components/composed` (shadcn `registry:component`).
 * - `blocks`     — opinionated, single-purpose assemblies (login, navbar, sidebar, …).
 *                  Source lives in `src/components/blocks` (shadcn `registry:block`).
 */
export type RegistryCategory = "atoms" | "components" | "blocks"

export type RegistryStatus = "planned" | "in-progress" | "stable"

/** One documented prop, rendered in the "Props" table of an entry page. */
export interface PropDef {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}

export interface RegistryEntry {
  /** URL segment and shadcn registry name, e.g. "button" → /atoms/button */
  slug: string
  /** Display name, e.g. "Button" */
  name: string
  description: string
  category: RegistryCategory
  status: RegistryStatus
  /**
   * Demo rendered inside <ComponentPreview>, wrapped in React.lazy at module
   * scope: `React.lazy(() => import("./demos/<slug>-demo"))`. Demos live in
   * `src/registry/demos`. Leave undefined while `status` is "planned" — the
   * entry page shows a placeholder instead.
   */
  preview?: React.LazyExoticComponent<React.ComponentType>
  /** Documented props/options, shown on the entry page. */
  props?: PropDef[]
  /** Import + usage snippet, shown on the entry page. */
  usage?: string
  /** Slugs of other registry entries this one is built from. */
  registryDependencies?: string[]
  /** Set the title type of the preview */
  titleStyle?: TitleStyleType
}

export interface CategoryDef {
  category: RegistryCategory
  /** Route path segment, e.g. "atoms" → /atoms */
  path: string
  title: string
  description: string
}
