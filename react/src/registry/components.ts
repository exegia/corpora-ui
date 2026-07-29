import type { RegistryEntry } from "./schema"

/**
 * Components — purposeful compositions of atoms with a clear intent but no
 * opinionated layout or copy. Source lives in `src/components/composed`.
 */
export const components: RegistryEntry[] = [
  {
    slug: "search-field",
    name: "Search Field",
    description:
      "Input with a prefixed search icon and a trailing clear button.",
    category: "components",
    status: "planned",
    registryDependencies: ["input", "button"],
  },
]
