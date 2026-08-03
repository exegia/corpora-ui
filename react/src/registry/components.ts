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
    slug: "user-avatar",
    name: "User Avatar",
    description:
      "Identity avatar: an image when one is given, initials otherwise. A remote src holds a skeleton until it resolves instead of flashing initials.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/user-avatar-demo")),
    registryDependencies: ["avatar", "skeleton"],
    props: [
      {
        name: "src",
        type: "string",
        description:
          "Image URL. Without one the initials show immediately — no skeleton. A failed load settles on the initials.",
      },
      {
        name: "name",
        type: "string",
        default: '""',
        description:
          "Drives the initials (first + last word) and the alt text unless alt overrides it.",
      },
      {
        name: "initials",
        type: "string",
        description: "Overrides the initials derived from name.",
      },
      {
        name: "alt",
        type: "string",
        description:
          'Alt text for the image. Pass "" when adjacent text already names the person.',
      },
      {
        name: "loading",
        type: "boolean",
        description:
          "Forces the skeleton, for when the identity itself is still being fetched. Omitted, it follows the image.",
      },
    ],
    usage: `import { UserAvatar } from "@corpora/ui"

<UserAvatar name="Jenny Hamilton" src={avatarUrl} className="size-10" />`,
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
