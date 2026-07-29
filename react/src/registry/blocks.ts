import type { RegistryEntry } from "./schema"

/**
 * Blocks — opinionated assemblies built for a single purpose.
 * Source lives in `src/components/blocks`.
 */
export const blocks: RegistryEntry[] = [
  {
    slug: "login",
    name: "Login",
    description: "Full login form with email, password and provider actions.",
    category: "blocks",
    status: "planned",
  },
  {
    slug: "navbar",
    name: "Navbar",
    description: "Application top navigation with branding and user menu.",
    category: "blocks",
    status: "planned",
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    description: "Collapsible application sidebar navigation.",
    category: "blocks",
    status: "planned",
  },
]
