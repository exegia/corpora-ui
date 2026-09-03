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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
          "navigation: app nav — 3-level data promotes the top level to collapsible section names. toc: top-level nodes are routes, deeper rows jump to #{id} after select; parents expand from an overlay chevron. sidebar: single-level icon rail that fills its container; collapsing folds labels to icon tiles. files: compact explorer with rename, drag-and-drop and trailing actions.",
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
      'Brand lockup: a mark beside a wordmark. The mark is an SVG, an image, or a monogram tile derived from the name; variant="mark" folds the wordmark away with the same motion a collapsing rail uses. With href the whole lockup is a home link.',
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
          'Renders the lockup as an anchor named by name — the usual "mark goes home" affordance.',
      },
    ],
    usage: `import { Logo } from "@corpora/ui"

<Logo name="Corpora" href="/" mark={<BrandMark />} />
<Logo name="Corpora" variant="mark" />  // icon rail: mark only`,
  },
  {
    slug: "ai",
    name: "AI",
    titleStyle: "titlebar",
    description:
      "Reusable AI thread pieces: the person's message bubble, the agent turn with its fan-out suggestions disclosure, frosted suggestion cards with a gliding reference chip, and the pill-to-field prompt composer.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/ai-demo")),
    registryDependencies: ["bubble", "card", "button", "textarea"],
    props: [
      {
        name: "UserMessage",
        type: "children / author / time / badge / reactions",
        description:
          "Right-aligned chat bubble for the person's message; with an author it grows the Bubble.Header row, and reactions hang a glass pill off the corner.",
      },
      {
        name: "AiMessage",
        type: "children / author / suggestions / isStreaming / onStop",
        description:
          "The agent turn: spark avatar, Agent badge, prose body with a polite live-region caret while streaming, and a violet \"Suggestions (n)\" disclosure that fans its SuggestionCard children out with a staggered spring. Controllable via suggestionsOpen.",
      },
      {
        name: "SuggestionCard",
        type: "heading / description / nodeId / state / reference / children",
        description:
          "Frosted collapsible card per suggestion. The state mark morphs (hollow → violet check → grey cross), the reference chip sits in the folded header and glides into the body on open, and the footer shows Ignore / \"Ok, fix them\" while pending (labels via rejectLabel / acceptLabel).",
      },
      {
        name: "ReferenceChip",
        type: "children / href / onClick",
        description:
          "\"Reference 1 ↗\" tag pointing at the grounding node. Renders as a link, a button or a plain tag depending on what it is given.",
      },
      {
        name: "GeneratedBlock",
        type: "content / isStreaming / onStop / citations",
        description:
          "Lower-level AI output with a persistent GENERATED label, streaming caret + Stop and citation chips — for hosts that keep their own author row.",
      },
      {
        name: "Composer",
        type: "value / onSend / onAttach / isStreaming / disabled",
        description:
          "A pill at rest showing the ⌘ + ↵ hint that springs into a taller field on focus, with the attach (+) and amber Send controls entering along the bottom edge. ⌘↩ sends, Esc stops while streaming; a safety note slot sits underneath.",
      },
    ],
    usage: `import { AiMessage, Composer, ReferenceChip, SuggestionCard, UserMessage } from "@exegia/corpora-ui"

<UserMessage author="Sender" badge="Admin" time="10 min ago">
  Validate this passage.
</UserMessage>
<AiMessage
  author="Exegia"
  suggestions={
    <SuggestionCard
      heading="Suggestion"
      description="Label mismatch"
      nodeId="p-17"
      reference={<ReferenceChip href="#p-17">Reference 1</ReferenceChip>}
      onAccept={apply}
      onReject={dismiss}
    >
      The canonical paragraph label is required by the schema.
    </SuggestionCard>
  }
>
  The boundary is valid — one label drifted.
</AiMessage>
<Composer onSend={(value, mode) => ask(value, mode)} onAttach={pickFile} />`,
  },
  {
    slug: "verse",
    name: "Verse",
    titleStyle: "titlebar",
    description:
      "Corpus verse line: a chapter link plus inline spans and note markers, each opening a click popover.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/verse-demo")),
    registryDependencies: ["text"],
    props: [
      {
        name: "chapter",
        type: "ReactNode",
        description:
          "Chapter reference rendered as a leading superscript link.",
      },
      {
        name: "href",
        type: "string",
        description: "Destination of the chapter link.",
      },
      {
        name: "chapterPopover / renderChapterPopover",
        type: "ReactNode | (props: TextPopoverRenderProps) => ReactNode",
        description:
          "Popover opened by clicking the chapter reference. Without it the chapter is a plain link.",
      },
      {
        name: "size",
        type: '"small" | "medium" | "large" | number',
        default: '"medium"',
        description:
          "Type scale for the verse. Nested VerseSpan/VerseNote inherit it unless they set their own.",
      },
    ],
    usage: `import { Verse, VerseNote, VerseSpan } from "@exegia/corpora-ui"

<Verse chapter="1:1" href="#gen-1" chapterPopover={<p>Genesis 1</p>}>
  In the beginning{" "}
  <VerseSpan popover={<p>Hebrew bereshit.</p>}>God created</VerseSpan>{" "}
  the heavens and the earth
  <VerseNote popover={<p>Textual note.</p>}>a</VerseNote>.
</Verse>`,
  },
  {
    slug: "search-field",
    name: "Search Field",
    titleStyle: "titlebar",
    description:
      "Input with a prefixed search icon and a trailing clear button.",
    category: "components",
    status: "planned",
    registryDependencies: ["input", "button"],
  },
]
