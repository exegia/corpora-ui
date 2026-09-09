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
        type: "heading / description / reference / state / onUndo / children",
        description:
          "Frosted collapsible card per suggestion. The state mark morphs (hollow → violet check → grey cross), `reference` takes one or many `{ id, title, url }` and renders a Reference chip per entry in the open body, and the footer shows Ignore / \"Ok, fix them\" while pending (labels via rejectLabel / acceptLabel) — then an Undo, if onUndo is given.",
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
        name: "SuggestedPrompt",
        type: "children / onSelect / layoutId",
        description:
          "One suggested prompt row — violet spark, the prompt, a `+` affordance. Pass them to Composer's suggestedPrompts and they fan out of a \"Suggestions (n)\" disclosure whose panel tucks behind the pill. Give the row and the resulting message bubble the same layoutId and picking it flies the row into the bubble.",
      },
      {
        name: "Composer",
        type: "value / onSend / onAttach / suggestedPrompts / isStreaming / disabled",
        description:
          "A pill at rest showing the ⌘ + ↵ hint that springs into a taller field on focus, with the attach (+) and amber Send controls entering along the bottom edge. ⌘↩ sends, Esc stops while streaming; a safety note slot sits underneath.",
      },
    ],
    usage: `import { AiMessage, Composer, SuggestedPrompt, SuggestionCard, UserMessage } from "@exegia/corpora-ui"

<UserMessage author="Sender" badge="Admin" time="10 min ago">
  Validate this passage.
</UserMessage>
<AiMessage
  author="Exegia"
  suggestions={
    <SuggestionCard
      heading="Suggestion"
      description="Label mismatch"
      reference={{ id: "p-17", title: "Reference 1", url: "#p-17" }}
      onAccept={apply}
      onReject={dismiss}
      onUndo={reset}
    >
      The canonical paragraph label is required by the schema.
    </SuggestionCard>
  }
>
  The boundary is valid — one label drifted.
</AiMessage>
<Composer
  onSend={(value, mode) => ask(value, mode)}
  onAttach={pickFile}
  suggestedPrompts={prompts.map((prompt) => (
    <SuggestedPrompt key={prompt.id} layoutId={prompt.id} onSelect={() => ask(prompt.text, "answer")}>
      {prompt.text}
    </SuggestedPrompt>
  ))}
/>`,
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
    slug: "emoji-action-bar",
    name: "Emoji action bar",
    titleStyle: "titlebar",
    description:
      "Compact reaction picker: a toolbar of quick reaction emoji built on the action-bar composed component, with a trailing More action that swaps the surface for the full frimousse picker. Designed to sit inside a glass popover.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/emoji-action-bar-demo")),
    registryDependencies: ["popover", "toolbar", "tooltip", "emoji-picker"],
    props: [
      {
        name: "onEmojiSelect",
        type: "(emoji: { emoji, label }) => void",
        description:
          "Fires for both a quick reaction and a pick from the full picker, so a caller wires one handler.",
      },
      {
        name: "reactions",
        type: "readonly Emoji[]",
        default: "QUICK_REACTIONS",
        description:
          "The quick row. frimousse cannot render a subset — EmojiPicker.Root exposes only columns/skinTone/locale/emojiVersion/emojibaseUrl/sticky, and its list is virtualized on fixed-height rows, so a fixed list is the only way to show just a few. It also costs no network request: the emoji CDN is fetched only if More is opened.",
      },
      {
        name: "hideMore",
        type: "boolean",
        default: "false",
        description:
          "Drops the trailing More action, leaving the quick row only — nothing then loads emoji data at all.",
      },
    ],
    usage: `import { EmojiActionBar } from "@exegia/corpora-ui"

<PopoverGlass glassVariant="frosted">
  <EmojiActionBar onEmojiSelect={({ emoji, label }) => react(emoji, label)} />
</PopoverGlass>`,
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
  {
    slug: "attachment",
    name: "Attachment",
    titleStyle: "titlebar",
    description:
      "One attachment in every shape the chat needs: a 240×52 composer chip with a remove button, or the in-bubble preview — for documents, images, media (and audio), corpus text selections, quoted replies, @-handles and URL cards.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/attachment-demo")),
    registryDependencies: ["chat-atoms"],
    props: [
      { name: "kind", type: '"document" | "image" | "media" | "text-selection" | "chat-reply" | "username-handle" | "url-link"', required: true, description: "Which attachment; picks the leading icon and the preview layout." },
      { name: "variant", type: '"default" | "preview"', default: '"default"', description: "Composer chip or in-bubble rendering." },
      { name: "title / meta", type: "ReactNode", description: "Primary and secondary chip lines." },
      { name: "onRemove / removable", type: "() => void / boolean", description: "The chip's ✕. Hidden when no handler is passed or removable is false." },
      { name: "kind props", type: "src, poster, duration, audio, onPlay, quote, author, time, body, initials, domain, description, favicon, href, onAction", description: "Accepted per kind; the union type rejects props that don't belong to the chosen kind." },
    ],
    usage: `import { Attachment } from "@corpora/ui"

<Attachment kind="document" title="Q3-financial-report.pdf" meta="PDF · 2.4 MB" onRemove={remove} />
<Attachment kind="url-link" variant="preview" title="Exegia UI" domain="sketch.com" description="…" href="https://sketch.com" />`,
  },
  {
    slug: "chart",
    name: "Chart",
    titleStyle: "titlebar",
    description:
      "320×244 chart card — pie, area, line or bar — with title, subtitle, type pill, plot and legend. Series colours come from the --chart-series-1…5 tokens, grid from --chart-grid.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/chart-demo")),
    registryDependencies: ["chat-presentation-atoms"],
    props: [
      { name: "type", type: '"pie" | "area" | "line" | "bar"', required: true, description: "Plot kind." },
      { name: "data", type: "{ label: string; [key]: number | string }[]", required: true, description: "One row per x label (or pie slice)." },
      { name: "series", type: "{ key, label, color?, format? }[]", required: true, description: "Keys to plot; colour defaults to the series token by position. Pie uses the first. `format` renders the value in the legend and hover tooltip." },
      { name: "title / subtitle / badge", type: "ReactNode", description: "Header row; badge defaults to the type name." },
      { name: "center", type: "{ value, label? }", description: "Pie only: donut centre." },
      { name: "headerless / plotHeight", type: "boolean / number", description: "Bare plot for embedding (InsightCards)." },
    ],
    usage: `import { Chart } from "@corpora/ui"

<Chart type="bar" title="Sales by flavor" subtitle="Units · last 6 months"
  data={[{ label: "Pist.", units: 62 }, { label: "Vanilla", units: 88 }]}
  series={[{ key: "units", label: "Units sold" }]} />`,
  },
  {
    slug: "markdown",
    name: "Markdown",
    titleStyle: "titlebar",
    description:
      "Rendered markdown behind a Preview | Markup toggle, with copy and expand controls. The active pane lives in a keyed Jotai atom so an app can flip a card by id.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/markdown-demo")),
    registryDependencies: ["chat-presentation-atoms"],
    props: [
      { name: "source", type: "string", required: true, description: "Markdown text (headings, paragraphs, lists, inline and fenced code)." },
      { name: "markdownId", type: "string", description: "Stable id for the view atom; unnamed cards use useId()." },
      { name: "view / defaultView / onViewChange", type: '"preview" | "markup"', description: "Controlled or uncontrolled pane." },
      { name: "onCopy / onExpand", type: "(source) => void / () => void", description: "Header icon buttons." },
      { name: "bare", type: "boolean", default: "false", description: "Drop the card border." },
    ],
    usage: `import { Markdown } from "@corpora/ui"

<Markdown source={answer} onCopy={(md) => navigator.clipboard.writeText(md)} />`,
  },
  {
    slug: "research-answer",
    name: "Research answer",
    titleStyle: "titlebar",
    description:
      "Answer card with a kicker, the content, Source / Date / Author(s) meta and an actions row: Copy citation, Share, Add to list, thumbs up / down.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/research-answer-demo")),
    registryDependencies: ["chat-presentation-atoms", "button"],
    props: [
      { name: "content", type: "ReactNode", required: true, description: "The answer." },
      { name: "kicker / kickerSub / corpus", type: "ReactNode", description: "Header row; corpus renders as a pill." },
      { name: "source / date / authors", type: "ReactNode", description: "Meta columns; omitted ones are hidden." },
      { name: "onCopyCitation / onShare / onAddToList / onFeedback", type: "() => void / (vote) => void", description: "Actions. Add to list behaviour is not designed — the callback is all the card does." },
    ],
    usage: `import { ResearchAnswer } from "@corpora/ui"

<ResearchAnswer corpus="Iliad" content="…" source="Iliad · Homer corpus" date="c. 750 BCE" authors="Homer" onFeedback={vote} />`,
  },
  {
    slug: "streaming-text",
    name: "Streaming text",
    titleStyle: "titlebar",
    description:
      "Streamed answer: word-by-word reveal with a caret, inline source chips, an action row, a collapsible sources panel (keyed atom) and follow-up prompts.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/streaming-text-demo")),
    registryDependencies: ["chat-presentation-atoms"],
    props: [
      { name: "paragraphs", type: '(string | StreamingToken[])[]', required: true, description: "Each paragraph is words or tokens; `{ cite }` renders an inline SourceChip." },
      { name: "streaming / wordMs", type: 'boolean / number', default: '55', description: "Animate the reveal; reduced motion shows everything at once." },
      { name: "sources / sourcesLabel", type: 'StreamingSource[] / ReactNode', description: "Rows of the collapsible panel; open state lives in streamingSourcesOpenAtom(id)." },
      { name: "followUps / onFollowUp", type: 'string[] / (text) => void', description: "Follow-up rows." },
      { name: "onCopy / onRegenerate / onFeedback", type: 'callbacks', description: "Action row." },
    ],
    usage: `import { StreamingText } from "@corpora/ui"

<StreamingText streaming paragraphs={[answer, [{ cite: "scoopdata.io" }, ...]]} sources={sources} followUps={["…"]} />`,
  },
  {
    slug: "recommendation-card",
    name: "Recommendation card",
    titleStyle: "titlebar",
    description:
      "Human-in-the-loop proposal: title, description with entity and lead-time pills, other options with signal bars, confidence and Accept / Alternatives.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/recommendation-card-demo")),
    registryDependencies: ["chat-presentation-atoms", "button"],
    props: [
      { name: "title / description", type: 'ReactNode', required: true, description: "Header and the sentence before the entity pill." },
      { name: "entity / descriptionSuffix / leadTime", type: '{ name, initials?, src? } / ReactNode / ReactNode', description: "Inline pills." },
      { name: "options / onSelectOption", type: 'RecommendationOption[] / (index) => void', description: "Rows under Other options." },
      { name: "confidence", type: '"high" | "medium" | "low"', default: '"high"', description: "Footer signal." },
      { name: "onAccept / onAlternatives", type: '() => void', description: "Footer buttons." },
    ],
    usage: `import { RecommendationCard } from "@corpora/ui"

<RecommendationCard title="Want me to place this restock order?" description="Reorder waffle cones from" entity={{ name: "Cone King" }} leadTime="7 days" onAccept={accept} />`,
  },
  {
    slug: "context-cards",
    name: "Context cards",
    titleStyle: "titlebar",
    description:
      "Retrieved chunks: header with a count pill, then a card per chunk with title, character count, snippet and the source file pill.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/context-cards-demo")),
    registryDependencies: ["chat-presentation-atoms"],
    props: [
      { name: "cards", type: 'ContextCard[]', required: true, description: "title, meta, snippet, file { name, type }." },
      { name: "header / count", type: 'ReactNode', description: "Defaults to All chunks and cards.length." },
      { name: "onOpen", type: '(card, index) => void', description: "File pill click." },
    ],
    usage: `import { ContextCards } from "@corpora/ui"

<ContextCards count={32} cards={[{ title: "Vendor onboarding rule", meta: "290 characters", snippet: "…", file: { name: "SOP.pdf", type: "PDF" } }]} />`,
  },
  {
    slug: "code-block",
    name: "Code block",
    titleStyle: "titlebar",
    description:
      "Code card with filename, Code | Diff toggle and Copy; gutter line numbers and keyword / string tinting from the --code-* tokens. No highlighter dependency.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/code-block-demo")),
    registryDependencies: ["chat-presentation-atoms", "button"],
    props: [
      { name: "code", type: 'string', required: true, description: "Source; split on newlines." },
      { name: "filename", type: 'ReactNode', description: "Header label." },
      { name: "diff", type: '{ type?: "add" | "remove", text }[]', description: "Enables the Diff view." },
      { name: "view / defaultView / onViewChange", type: '"code" | "diff"', description: "Controlled or uncontrolled." },
      { name: "onCopy", type: '(code) => void', description: "Copy button." },
      { name: "keywords", type: 'string[]', description: "Extra keywords to tint." },
    ],
    usage: `import { CodeBlock } from "@corpora/ui"

<CodeBlock filename="churn.ts" code={source} onCopy={copy} />`,
  },
  {
    slug: "filter-table",
    name: "Filter table",
    titleStyle: "titlebar",
    description:
      "Status filter pills over a compact table. The active filter lives in a keyed atom (filterTableFilterAtom) so an app can set it by table id.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/filter-table-demo")),
    registryDependencies: ["chat-presentation-atoms"],
    props: [
      { name: "statuses", type: '{ id, label, tone }[]', required: true, description: "Filter pills and status dot colours." },
      { name: "columns", type: '{ key, header, className? }[]', required: true, description: "Table columns; the status column renders a dot." },
      { name: "rows", type: '{ id, status, … }[]', required: true, description: "Rows; filtered by status." },
      { name: "filter / onFilterChange", type: 'string | null', description: "Controlled filter; null is All." },
    ],
    usage: `import { FilterTable } from "@corpora/ui"

<FilterTable statuses={statuses} columns={columns} rows={rows} />`,
  },
  {
    slug: "records-table",
    name: "Records table",
    titleStyle: "titlebar",
    description:
      "Selectable records with an initial avatar, tags with +N overflow, relative date and connection strength. Selection lives in recordsTableSelectionAtom(id); sorting is a callback only.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/records-table-demo")),
    registryDependencies: ["chat-presentation-atoms", "checkbox"],
    props: [
      { name: "rows", type: 'RecordsRow[]', required: true, description: "id, name, initial, tags, lastInteraction, strength." },
      { name: "selected / onSelectionChange", type: 'ReadonlySet<string>', description: "Controlled selection." },
      { name: "onSortChange", type: '(column) => void', description: "Header sort control; the design shows no direction." },
      { name: "maxTags", type: 'number', default: '2', description: "Tags shown before +N." },
    ],
    usage: `import { RecordsTable } from "@corpora/ui"

<RecordsTable rows={rows} onSortChange={sortBy} />`,
  },
  {
    slug: "flowchart",
    name: "Flowchart",
    titleStyle: "titlebar",
    description:
      "Dot-grid canvas with a vertical chain of Trigger and If / Else nodes built from data.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/flowchart-demo")),
    registryDependencies: ["chat-presentation-atoms"],
    props: [
      { name: "nodes", type: 'FlowchartNode[]', required: true, description: "A trigger node (title, description, icon) or a condition node whose rows mix words and pills ({ pill, accent? })." },
    ],
    usage: `import { Flowchart } from "@corpora/ui"

<Flowchart nodes={[{ kind: "trigger", title: "New order created" }, { kind: "condition", rows: [{ parts: ["If", { pill: "order" }, "is", { pill: "Rocky Road", accent: true }] }] }]} />`,
  },
  {
    slug: "insight-cards",
    name: "Insight cards",
    titleStyle: "titlebar",
    description:
      "Paged insights: header with count and prev / next, summary, two stats, a trend snapshot (line plot) and a follow-up prompt.",
    category: "components",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/insight-cards-demo")),
    registryDependencies: ["chat-presentation-atoms", "chart"],
    props: [
      { name: "insights", type: 'Insight[]', required: true, description: "summary, stats (StatProps[]), snapshot { data, series }, followUp." },
      { name: "index / defaultIndex / onIndexChange", type: 'number', description: "Which insight is shown." },
      { name: "onFollowUp", type: '(text) => void', description: "Follow-up pill." },
    ],
    usage: `import { InsightCards, InsightEntity } from "@corpora/ui"

<InsightCards insights={[{ summary: <>Worst performer in <InsightEntity>Creamery</InsightEntity>…</>, stats: [...], snapshot: { data, series } }]} />`,
  },
]
