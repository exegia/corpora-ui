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
      "Identity avatar: an image when one is given, initials otherwise, with an online/offline badge and a pointer-lit embossed bezel. A remote src holds a skeleton until it resolves instead of flashing initials. State lives in Jotai atoms keyed by avatarId.",
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
      {
        name: "presence",
        type: '"online" | "offline"',
        description:
          "Corner badge — a filled green dot for online, a hollow ring for offline, each named for assistive tech. Controlled when passed; omitted, the badge follows the store (see avatarId).",
      },
      {
        name: "bezel",
        type: "boolean",
        default: "true",
        description:
          "Embossed rim whose highlight follows the pointer's bearing from the avatar (rAF-coalesced, one write per frame at most). Light/dark aware, and with a photo it samples the image's rim lightness (CORS permitting) to weight highlight against shadow — a softer white over a dark portrait, a lighter shadow over a pale one. Static under reduced motion. false renders a flat disc.",
      },
      {
        name: "avatarId",
        type: "string",
        description:
          "Names this avatar's slice of the Jotai store: useUserAvatarState(id) reads presence / bezelAngle / imageStatus / imageTone, useUserAvatarActions(id).setPresence() flips the badge from anywhere under ExegiaProvider. Unnamed avatars key off useId and are dropped on unmount.",
      },
    ],
    usage: `import { UserAvatar } from "@corpora/ui"

<UserAvatar name="Jenny Hamilton" src={avatarUrl} className="size-10" />`,
  },
  {
    slug: "tree",
    name: "Tree",
    description:
      "Nested item tree in four shapes: app navigation with collapsible sections, a table of contents, an icon rail, and an editable file explorer. Every row is a Button; navigation flows through onNavigate.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/tree-demo")),
    props: [
      {
        name: "variant",
        type: '"navigation" | "toc" | "sidebar" | "files"',
        description:
          "navigation: app nav — 3-level data promotes the top level to collapsible section names. toc: top-level nodes are routes, deeper rows jump to #{id} after select; parents expand from an overlay chevron. sidebar: single-level icon rail (40px collapsed). files: compact explorer with rename, drag-and-drop and trailing actions.",
      },
      {
        name: "items",
        type: "TreeNode[]",
        description:
          "The tree data — id, label, icon, href (metadata for onNavigate; rows never render anchors, though toc rows below the route level still jump to #{id} or a #hash href), badge, defaultOpen, children.",
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
          "Fires for every selection after the node's own onSelect. Rows are buttons, so this is the routing path — wire your router's navigate here. toc rows below the route level additionally jump to #{id} after it fires.",
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
      {
        name: "treeId",
        type: "string",
        description:
          "Names this instance in the shared store so useTreeState(id) / useTreeActions(id) can reach it from anywhere under ExegiaProvider. A named tree keeps its state across unmounts (a rail's fold survives a route change) — call removeTreeInstance(id) on teardown. Unnamed trees are dropped on unmount.",
      },
    ],
    usage: `import { Tree, useTree, useTreeActions, useTreeState } from "@corpora/ui"

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
<Button onClick={() => tree.startRename(tree.activeId!)}>Rename</Button>

// By id — no controller to pass around. Needs <ExegiaProvider> at the root.
<Tree variant="sidebar" treeId="app-nav" items={items} />

// …anywhere else in the app:
const nav = useTreeActions("app-nav")          // writes only, never re-renders
const { collapsed } = useTreeState("app-nav")  // subscribes to the tree
<Button onClick={nav.toggleCollapsed}>{collapsed ? "Expand" : "Fold"} rail</Button>`,
  },
  {
    slug: "logo",
    name: "Logo",
    description:
      "Brand lockup: a mark beside a wordmark. The mark is an SVG, an image, or a monogram tile derived from the name; variant=\"mark\" folds the wordmark away with the same motion a collapsing rail uses. With href the whole lockup is a home link.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/logo-demo")),
    props: [
      {
        name: "name",
        type: "string",
        required: true,
        description:
          "Brand name. Labels the logo for AT (and the link, when href renders one), drives the default wordmark, and the monogram tile when no mark is given.",
      },
      {
        name: "mark",
        type: "ReactNode",
        description:
          "Custom mark — an inline SVG sized to fill its box. Wins over src.",
      },
      {
        name: "src",
        type: "string",
        description:
          "Image URL for the mark. Decorative — name labels the logo. Without mark or src, a monogram tile derived from name renders instead.",
      },
      {
        name: "wordmark",
        type: "ReactNode",
        description: "Wordmark content. Defaults to name.",
      },
      {
        name: "variant",
        type: '"full" | "mark"',
        default: '"full"',
        description:
          "mark folds the wordmark away (width, opacity, slight x) and hides it from AT; the root keeps the accessible name. Reduced-motion aware.",
      },
      {
        name: "href",
        type: "string",
        description:
          "Renders the lockup as an anchor named by name — the usual \"mark goes home\" affordance.",
      },
    ],
    usage: `import { Logo } from "@corpora/ui"

<Logo name="Corpora" href="/" mark={<BrandMark />} />
<Logo name="Corpora" variant="mark" />  // icon rail: mark only`,
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
