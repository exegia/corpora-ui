import { atoms } from "./atoms"
import { blocks } from "./blocks"
import { components } from "./components"
import type { CategoryDef, RegistryCategory, RegistryEntry } from "./schema"

export type { CategoryDef, PropDef, RegistryCategory, RegistryEntry, RegistryStatus } from "./schema"

export const categories: CategoryDef[] = [
  {
    category: "atoms",
    path: "atoms",
    title: "Atoms",
    description:
      "The lowest-level primitives — buttons, inputs, icons, text. What lives in components/ui after a shadcn install.",
  },
  {
    category: "components",
    path: "components",
    title: "Components",
    description:
      "Purposeful compositions of atoms with a clear intent, but not opinionated enough to be a block.",
  },
  {
    category: "blocks",
    path: "blocks",
    title: "Blocks",
    description:
      "Opinionated assemblies designed for a single purpose — login, signup, navbar, sidebar.",
  },
]

export const registry: Record<RegistryCategory, RegistryEntry[]> = {
  atoms,
  components,
  blocks,
}

export function getCategory(path: string): CategoryDef | undefined {
  return categories.find((c) => c.path === path)
}

export function getEntries(category: RegistryCategory): RegistryEntry[] {
  return registry[category]
}

export function getEntry(
  category: RegistryCategory,
  slug: string
): RegistryEntry | undefined {
  return registry[category].find((entry) => entry.slug === slug)
}
