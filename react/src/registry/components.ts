import * as React from "react"

import type { RegistryEntry } from "./schema"

/**
 * Components — purposeful compositions of atoms with a clear intent but no
 * opinionated layout or copy. Source lives in `src/components/composed`.
 */
export const components: RegistryEntry[] = [
  {
    slug: "password-input",
    name: "Password Input",
    description:
      "Password field with visibility toggle and animated strength meter.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/password-input-demo")),
    registryDependencies: ["input-group", "button"],
    props: [
      {
        name: "visibilityToggle",
        type: "boolean",
        default: "true",
        description: "Show the eye toggle button.",
      },
      {
        name: "showStrength",
        type: "boolean",
        default: "false",
        description: "Show the animated strength meter and requirements.",
      },
      {
        name: "sound",
        type: "boolean",
        default: "true",
        description:
          "Reveal/hide cues on the visibility toggle. Silent until bindSounds().",
      },
    ],
    usage: `import { PasswordInput } from "@corpora/ui"

<PasswordInput showStrength autoComplete="new-password" />`,
  },
  {
    slug: "social-providers",
    name: "Social Providers",
    description:
      "Social auth buttons (Google, Apple, GitHub, X) in stacked or icon-row layout.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/social-providers-demo")),
    registryDependencies: ["button"],
    props: [
      {
        name: "providers",
        type: '("google" | "apple" | "github" | "x")[]',
        default: '["google", "apple", "github"]',
        description: "Providers to render, in order.",
      },
      {
        name: "action",
        type: '"login" | "signup" | "continue"',
        default: '"continue"',
        description: "Verb used in the button labels.",
      },
      {
        name: "layout",
        type: '"stack" | "row"',
        default: '"stack"',
        description: "Full-width labeled buttons or an icon-only row.",
      },
      {
        name: "loadingProvider",
        type: "SocialProvider | null",
        default: "null",
        description: "Marks one provider as loading and disables the rest.",
      },
    ],
    usage: `import { SocialProviders } from "@corpora/ui"

<SocialProviders action="login" onSelect={(provider) => signIn(provider)} />`,
  },
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
