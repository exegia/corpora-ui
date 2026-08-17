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
    slug: "tree",
    name: "Tree",
    description:
      "Nested item tree in four shapes: app navigation with collapsible sections, a table of contents with in-page anchors, an icon rail, and an editable file explorer.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/tree-demo")),
    props: [
      {
        name: "variant",
        type: '"navigation" | "toc" | "sidebar" | "files"',
        description:
          "navigation: app nav — 3-level data promotes the top level to collapsible section names. toc: top-level nodes are routes, deeper nodes anchor to #{id}. sidebar: single-level icon rail. files: compact explorer with rename, drag-and-drop and trailing actions.",
      },
      {
        name: "items",
        type: "TreeNode[]",
        description:
          "The tree data — id, label, icon, href, badge, defaultOpen, children.",
      },
      {
        name: "activeId",
        type: "string",
        description:
          "id of the current entry, any depth. Marks the row aria-current and expands its collapsed ancestors.",
      },
      {
        name: "onNavigate",
        type: "(node: TreeNode) => void",
        description:
          "Fires for every selection after the row's anchor default — wire your router's navigate here.",
      },
      {
        name: "collapsed",
        type: "boolean",
        default: "false",
        description:
          "sidebar only — folds rows to their leading icon; the label moves into aria-label and a hover/focus tooltip.",
      },
      {
        name: "onMove",
        type: "(id, parentId: string | null, index: number) => void",
        description:
          "files only — enables drag-and-drop. Reorder items yourself; the moveNode helper is exported.",
      },
      {
        name: "onRename",
        type: "(id, label: string) => void",
        description: "files only — enables inline rename (double-click or F2).",
      },
      {
        name: "renderTrailing",
        type: "(node: TreeNode) => ReactNode",
        description:
          "files only — row actions revealed on hover/focus, e.g. a menu or delete button. Rendered beside the row, not inside it, so the content may be interactive; the row reserves ~36px for it, and a wider slot overlaps the truncated label.",
      },
      {
        name: "sound",
        type: "boolean",
        default: "true",
        description: "Expand/collapse cues. Silent until bindSounds().",
      },
      {
        name: "tree",
        type: "TreeController",
        description:
          "A useTree() controller, in place of items and the handler props. Every behaviour — expand, collapse, select, rename, reorder, fold the rail — becomes callable from outside the component.",
      },
    ],
    usage: `import { Tree, useTree } from "@corpora/ui"

// Props form — the tree owns its state.
<Tree
  variant="navigation"
  items={items}
  activeId={pathnameId}
  onNavigate={(node) => navigate(node.href!)}
/>

// Controller form — drive it from anywhere.
const tree = useTree({ variant: "files", defaultItems: files })

<Tree tree={tree} />
<Button onClick={tree.collapseAll}>Collapse all</Button>
<Button onClick={() => tree.startRename(tree.activeId!)}>Rename</Button>`,
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
