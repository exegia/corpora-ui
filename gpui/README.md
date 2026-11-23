# corpora-ui — gpui

The GPUI counterpart of the React library in `../react`, built on
[GPUI Kit](https://gpui-kit.com) (`gpui-kit` 0.10: GPUI, GPUI Base, GPUI
Component and the default icons behind one dependency).

```sh
cargo run -p corpora-ui --example gallery                      # open the gallery
cargo run -p corpora-ui --example gallery -- --snapshot <dir>  # render every page to PNGs, no window
cargo test -p corpora-ui
cargo clippy -p corpora-ui --all-targets
```

## Gallery hot reload

From the repository root, run `make gpui-gallery-dev`. In Zed, open the
repository root and run **GPUI gallery: hot reload** from `task: spawn`.
Saving Rust render code rebuilds and patches the running gallery through
GPUI's Subsecond integration, preserving its existing view state. Changes to
state layouts or startup code may require a full restart; stop and rerun the
task in that case. This is a development-only, experimental hot-patch mode.

Install the matching CLI with `cargo install dioxus-cli --version 0.7.10 --locked`.
The target uses `~/.cargo/bin/dx` explicitly because Deno also provides a `dx`
command. Override it with `make gpui-gallery-dev DX=/path/to/dioxus/dx` if needed.
The official macOS prebuilt CLI additionally needs `brew install openssl@3`.

The `hot-reload` feature is opt-in. Its optional `gpui-pre` dependency enables
the feature on the same vendored GPUI already used by `gpui-kit` (0.10 does not
forward it). Ordinary `cargo run` and release builds retain their normal behavior.

## Layout

```text
gpui/
├── crates/corpora-ui/
│   ├── src/
│   │   ├── foundations/   # tokens: color, theme, radius, motion, shadow, size, typography
│   │   ├── atoms/         # basic elements
│   │   ├── composed/      # atoms assembled into one piece of interface
│   │   └── blocks/        # composed pieces arranged into a region of an app
│   ├── assets/            # fonts (Allo, Caudex), Reicon icons, brand marks, images
│   ├── examples/gallery.rs
│   └── tests/             # atoms.rs, composed.rs, blocks.rs
├── scripts/reicon.mjs     # regenerates assets/icons and src/reicon.rs
└── vendor/                # GPUI with the glass backdrop pass; see vendor/README.md
```

## Usage

Register `corpora_ui::Assets` and call `corpora_ui::init(cx)` once at startup,
in place of `gpui_kit::assets::Assets` and `gpui_kit::init`. `init`
initializes GPUI Kit and installs the Corpora light and dark themes.

```rust
use corpora_ui::atoms::{Button, Card, CardHeader};

gpui_kit::application().with_assets(corpora_ui::Assets).run(|cx| {
    corpora_ui::init(cx);
    // open a window
});

Card::new()
    .header(CardHeader::new("Members").description("People with access"))
    .content(member_list)
    .footer(Button::new("invite").primary().label("Invite"))
```

## How the port works

GPUI Component already ships most of the primitives the React library builds
by hand. So the port has two halves:

1. **Foundations** project `react/src/assets/css/theme.css` onto GPUI
   Component's theme. Stock components then render in the Corpora palette
   with no wrapper. Roles that theme has no slot for (`card`, `invert`, the
   status text shades) live in the `CorporaTheme` global, read with
   `cx.palette()`.
2. **Atoms** re-export the stock elements that already match, and implement
   only what GPUI Component lacks.

| React | GPUI | Source |
| --- | --- | --- |
| `Button` | `Button`, `ButtonKind` | this crate, on the stock button |
| `Badge` | `Badge` | this crate |
| `Card`, `CardHeader`, `CardPanel`, `CardFooter` | `Card`, `CardHeader` | this crate |
| `CardFrame` and its parts, `Frame`, `FramePanel` | `CardFrame`, `CardFrameHeader`, `Frame` | this crate |
| `Text`, `Heading`, `Paragraph`, `Span` | `Text` | this crate |
| `Label` (text level) | `Text::label` with a `LabelLevel` | this crate |
| `Loader` | `Loader` | this crate |
| `Avatar` | `Avatar`, `AvatarUser` | this crate, on the stock avatar |
| `Bubble` and its parts | `Bubble`, `BubbleReaction` | this crate |
| `Reference` | `Reference` | this crate, on the stock button and hover card |
| `InputField` | `InputField` | this crate, on the stock input |
| `SourceChip`, `SelectChip` | `Chip`, `SelectChip` | this crate, on the stock dropdown menu |
| `EmojiPicker` | `EmojiPicker`, `EmojiPickerState`, `Emoji` | this crate, data from the `emojis` crate |
| `Texture` | `Texture`, `TextureVariant` | this crate |
| `Dot`, `Pill`, `Tag`, `FileTypeBadge` (`ui/chat`) | `Dot`, `Pill`, `Tag`, `FileTypeBadge`, with `Tone` and `TagTone` | this crate |
| `Stat`, `FollowUpRow`, `Signal` (`ui/chat`) | `Stat`, `FollowUpRow`, `Signal` | this crate |
| `SegmentedToggle` (`ui/chat`) | `SegmentedToggle` | this crate |
| `TextSelection`, `TextClickPopover` | `TextSelection`, `TextPopover` | this crate, on GPUI Base's window text selection |
| (height transitions) | `Reveal` | this crate, on GPUI Base's `MotionReveal` |
| liquid glass surfaces | `GlassSpec`, `GlassEdges`, `GlassSurfaceExt`, `glass` | this crate, on the patched GPUI in `vendor/` |
| `Label` (form), `Kbd`, `Separator`, `Skeleton`, `Spinner` | same names | GPUI Component |

Not ported yet: the `glass` button variant.

### Composed

| React | GPUI |
| --- | --- |
| `User.Info`, `User.Pill`, `User.Message` | `UserInfo`, `UserPill`, `UserMessage` |
| `AI.Avatar`, `AI.Message` | `AiIdentity`, `AiMessage` |
| `StreamingText` | `StreamingText`, `StreamToken` |
| `SuggestedPrompt`, `SuggestedPrompts` | same names |
| `ActionBar`, `EmojiActionBar` | same names |
| `Bubble.ReactionsButton` | `ReactionPicker` |
| `Logo` | `Logo` |
| `PasswordInput` | `PasswordInput`, `password_strength` |
| `SocialProviders` | `SocialProviders` |
| `SendHint` | `SendHint` |
| `Verse`, `VerseSpan`, `VerseNote` | `Verse` and its `span` and `note` |
| `SelectionPopover` | `SelectionCard`, `ReaderSelection`, inside a popover |
| `SelectionHighlight`, `AppliedMark`, `ApplyToast` | `SelectionHighlight`, `AppliedMark`, `ApplyToast` |
| `Attachment` | `Attachment`, `AttachmentKind` |
| `Markdown` | `Markdown` |
| `ResearchAnswer` | `ResearchAnswer` |
| `Tree` | `Tree`, `TreeNode`, `TreeVariant` |
| `CorpusNavigation.*` | `CorpusNavigation`, `LocationBar`, `HierarchyPicker`, `LocationGrid`, `ReferenceCommand`, `CorpusData`, `CorpusLevel`, `CorpusNode` |
| `Flowchart` | `Flowchart`, `FlowStep`, `FlowEdge` |
| `Chart` | `Chart`, `ChartKind`, `ChartRow`, `ChartSeries` |
| `Composer`, `SendButton`, `AddButton` | `Composer` (an entity), `ComposerEvent`, `ComposerOption`, `ComposerModel`, `ComposerAttachment`, `ComposerShape` |
| `Recommendation.Item`, `RecommendationCard` | `Recommendation`, `RecommendationOption`, `RecommendationState` |
| `CodeBlock` | `CodeBlock`, `DiffLine`, `tokenize` |
| `ContextCards` | `ContextCards`, `ContextCard` |
| `FilterTable` | `FilterTable`, `FilterStatus`, `FilterRow` |
| `RecordsTable` | `RecordsTable`, `RecordRow`, `RecordColumn` |
| `InsightCards` | `InsightCards`, `Insight`, `InsightAllocation`, `InsightSegment` |

```rust
use corpora_ui::composed::{AiMessage, StreamingText, UserMessage};

UserMessage::new("message-41", "Where does this reading come from?")
    .user(AvatarUser::named("Grace", "Hopper").role("Editor"))
    .description("2 min ago")

AiMessage::new("message-42")
    .child(StreamingText::from_text("message-42-text", [answer]).streaming(is_streaming))
```

Every composed piece is ported. From `ui/chat`, the favicon, source chip, avatar
stack, waveform and thumbnail wait for the pieces that use them.

### Blocks

| React | GPUI |
| --- | --- |
| `CorpusNavigator`, `NavigationPicker` | `CorpusNavigator`, `NavigationPicker` |
| `AiPanel`, `AiPanelHeader` | `AiPanel`, `AiPanelHeader` |
| `SuggestedPrompts` (the panel's) | `PromptList` |
| `RecommendationStack` | `RecommendationStack` |
| `LockedBanner`, `PinnedThreadBanner`, `DegradedBanner` | same names |
| `VersionHistoryRecord` | `VersionHistoryRecord`, `VersionHistoryEntry` |
| `IAiScope`, `formatScopeLabel` | `AiScope`, `AiScope::label` |
| `ProfileCardBlock`, `defaultProfileCardItems` | `ProfileCard`, `ProfileCard::default_items` |
| `IProfileCardAction`, `TProfileCardItem` | `ProfileAction`, `ProfileItem` |
| `ShellLayout`, `useShellPanels`, `useShellFitState` | `ShellLayout`, `Shell`, `ShellEvent` |
| `SHELL_WIDTHS`, `IShellSidebarFit` | `ShellWidths`, `RailMode` |
| `Scaffold.Root`, `.Canvas`, `.Actions`, `.Inspector`, `useScaffold` | `ScaffoldLayout`, `Scaffold`, `ScaffoldEvent` |
| `Scaffold.Panel`, `Scaffold.Tab` | `ScaffoldPanel`, `ScaffoldTab` |
| `AuthCard`, `AuthError`, `AuthSuccess`, `AuthSeparator` | same names |
| `LoginBlock`, `SignupBlock`, `ForgotPasswordBlock`, `UpdatePasswordBlock`, `CodeAuthBlock` | same names, with `LoginEvent`, `SignupEvent`, `ForgotPasswordEvent`, `UpdatePasswordEvent`, `CodeAuthEvent` |
| `OnboardingBlock`, `IOnboardingStepConfig`, `TOnboardingFieldConfig` | `OnboardingBlock`, `OnboardingStep`, `OnboardingField`, `OnboardingValue`, `OnboardingEvent` |
| `LinkedAccountsBlock`, `ILinkedIdentity` | `LinkedAccountsBlock`, `LinkedIdentity`, `LinkedAccountsEvent` |
| `PasskeyManagerBlock`, `IPasskeyRecord` | `PasskeyManagerBlock`, `Passkey`, `PasskeyManagerEvent` |
| `PasskeySignInBlock` | `PasskeySignInBlock`, `PasskeySignInEvent` |
| `AuthFlowBlock`, `useAuthFlow`, `useAuthFlowActions` | `AuthFlow`, `AuthFlowEvent`, `AuthStep` |
| `TAuthAccent`, `accent` | `AuthAccent`, `.accent()`, `set_accent`, `Button::fill` |
| `useAuthSession`, `IAuthUser`, `maskAuthIdentifier` | `AuthSession`, `AuthSessionEvent`, `AuthUser`, `mask_identifier` |
| `AISidebar`, `useAISidebar` | `ResourceSidebar`, `ResourceSidebarEvent` |
| `ISidebarResource`, `ISidebarResourceMove` | `SidebarResource`, `ResourceKind`, `ResourceMove`, `DropPosition` |

`sidebar-primitives` is not ported on
purpose: GPUI Component's own `sidebar` module (`Sidebar`, `SidebarMenu`,
`SidebarGroup`, `SidebarToggleButton`) is the same set of parts.

### Button

`Button` is this crate's own atom. It wraps the stock button, which still
supplies focus, keyboard activation, accessibility and the variant colors, and
adds the embossed surface, the size scale, the press squeeze and the trailing
icon.

```rust
Button::new("invite").primary().label("Invite")
Button::new("next").label("Continue").trailing_icon(IconName::ArrowRight)
Button::new("search").icon(IconName::Search).tooltip("Search")
```

| React `variant` | Builder | Surface |
| --- | --- | --- |
| `default` | `.primary()` | embossed accent fill |
| `secondary` | `.secondary()` | embossed neutral fill |
| `outline` | `.outline()` (the default) | embossed, on the page color with a border |
| `ghost` | `.ghost()` | flat |
| `destructive` | `.destructive()` | as primary |
| `destructive-outline` | `.destructive_outline()` | as outline, red text |
| `link` | GPUI Component's `Link`, for URLs only | |
| `glass` | not ported yet | |

| React `size` | Builder | Height | Inline padding |
| --- | --- | --- | --- |
| `xs` | `.xsmall()` | 20px (React: 24px) | 8px |
| `sm` | `.small()` | 24px (React: 28px) | 12px |
| `default` | none | 32px | 16px |
| `lg` | `.large()` | 32px (React: 36px) | 20px |
| `xl` | `.with_atom_size(AtomSize::Xl)` | 40px | 24px |

Heights keep GPUI Component's desktop density. Everything is in rems.

- **Shape.** Labelled buttons round to `Radius::Lg`. A button with an icon and
  no label is a circle.
- **Emboss.** A lit top edge and a shaded bottom edge inside the surface, with
  no drop shadow. It brightens under the pointer and goes out when disabled.
- **Hover and press.** The fill deepens on a light page and lifts on a dark
  one; a press sinks it. Those fills are theme tokens in
  `foundations/theme.rs`.
- **Press squeeze.** GPUI has no element transform, so a press pulls the
  surface in from every side by what `scale(0.96)` would take off the height,
  while the layout box holds still. The label itself does not shrink.
- **Trailing icon.** Seated in its own well; it leans 2px toward the trailing
  edge under the pointer. Both motions stop under reduced motion.

## Deliberate differences from React

- **Height changes go through `Reveal`.** GPUI cannot tween to an intrinsic
  size, so `Reveal` measures its content and grows to it: the suggestions
  panel, the strength checklist and the emoji picker all open and close this
  way. A folded `Logo` fades its wordmark, then drops it from the layout.
- **`SuggestedPrompts` is not tucked under a composer.** React pulls its
  bottom edge behind the composer pill; that belongs to the composer, which is
  not ported.
- **`SocialProviders` draws every provider as an outline button.** React
  fills Apple's black. The Apple and GitHub marks are Reicon's brand marks.
- **`EmojiActionBar` is as wide as its quick row**, and grows to the picker's
  width as the picker opens. It measures the row on its first frame.
  The picker's search field floats over the list on a blurred band, with a
  row of group filters under it; a filter scrolls the list to its group, and
  the group in view is marked. Group labels scroll with the list (React's are
  sticky), and there is no skin-tone control. An emoji
  newer than Emoji 15.1 is listed only if the text system has a glyph for it,
  so the list follows the machine's emoji font and never shows an empty box.
  Its surface is frosted glass.
- **`SelectChip` owns its menu.** Pass `options` and `on_pick`; React's
  `open`, `onToggle`, `width`, `align` and item `tag` are gone, and the stock
  menu places itself.
- **`ActionBar` takes commands, not components**, and drops a separator that
  has nothing on one side of it.
- **`SendHint` shows the platform's keys**: ⌘↵ on macOS, Ctrl+Enter elsewhere.
- **`StreamingText` fades words in without the blur**, and wraps word by
  word, so a long citation chip moves to the next line whole.
- **`PasswordInput` uses the stock show/hide toggle** and plays no sound.

- **Register `corpora_ui::Assets`.** With the stock asset source alone the
  icons are Lucide's, and `Reference` and a verified `Avatar` draw a blank
  where their icon belongs.
- **Icons are [Reicon](https://reicon.dev), served under Lucide names.** GPUI
  Component asks its asset source for `icons/search.svg`; `Assets` answers
  with Reicon's drawing, so stock components and Corpora ones share one icon
  language and `IconName` keeps working. To add or remap an icon, edit the
  table in `scripts/reicon.mjs` and run it. A name Reicon does not draw
  (`cone`, the window controls, a few others) still gets Lucide's.
- **The composer is an entity that reports events.** `Composer` owns its
  text, tray and menus, and emits `ComposerEvent` in place of React's
  callback props. One menu above the field serves `@` sources, `/` commands
  and the model choice. "Add photos & files" opens the system file dialog.
  There is no dictation, no slot for a custom submit button or menu, and
  the suggestions are not built in: put `SuggestedPrompts` above it. The
  controls drop under the text only when the message has a line break or
  `expanded` is set, not when a long line would crowd them.
- **Charts are drawn by GPUI Component, not ECharts.** `Chart` lays one
  stock line or area chart per series over a shared scale, so there are no
  `stacked`, `percent` or `horizontal` variants, no brush and no
  `chartOptions`. A bar chart shows one series at a time: the legend picks
  which. Rows carry their values in series order instead of keyed objects,
  values print with grouped thousands, and the header takes a text badge
  rather than a `Reference`. `InsightCards` still has no trend chart.
- **The flowchart lays out, selects and drags; it does not edit.**
  `Flowchart` draws the cards and connectors, selects a card on a click
  (lighting its connectors) and moves it on a drag. Left out: zoom and
  panning (GPUI has no scale transform for elements), the context menu,
  adding, removing, renaming and duplicating cards, picking or re-routing
  a connector and its toolbar, the if/else condition body, and the sample
  steps React shows when given none. The canvas is as wide as its parent
  rather than twice it, and a card is not narrowed to fit a small canvas.
- **The tree is a view, not a controller.** `Tree` draws the four shapes
  and remembers which branches are open; the owner holds the active id and
  moves it in `on_navigate`, which receives the row's id. There is no
  `useTree` controller, no rename, no drag-and-drop, no trailing row
  actions and no arrow-key navigation between rows. `href` and `target`
  have no counterpart: a contents row does not jump to an anchor.
  `force_open` stands in for `expandAll` on a filtered tree.
- **Corpus navigation is one entity and four views.** `CorpusNavigation`
  holds the corpus, the reading location, the draft and the history; the
  pieces take the entity instead of a `navigatorId`. A location is a node
  id, not a `{corpusId, editionId, nodeId}` anchor: one entity is one
  edition. `commit` is synchronous and emits `Navigate`; there is no
  `onNavigate` promise, pending state, error or retry, no saved history
  across editions, and no controlled mode. `ReferenceCommand` is an inline
  field with its results beneath it, not a modal on Cmd-K, and it matches
  references only: there is no text search. `LocationGrid` pages past 60
  choices with arrows but has no filter field and no arrow-key movement
  between cells. Right-to-left corpora are not mirrored.
  Draw one set of views per entity: their element ids derive from it, so
  two location bars on one entity collide.
- **The shell's state is an entity, its frame an element.** `Shell` holds
  which sides are open and how wide; `ShellLayout::new(id, &shell)` draws
  them. Widths are `ShellWidths` fields, not CSS variables. The rail's
  content does not read a panel context: fold it on `shell.collapsed()`.
  Panels are passed as elements (`left`, `right`); there is no `panels`
  record and no `openPanel(side, component)`. A drag resizes a column
  within its bounds and never folds it. The shell binds no key: bind one
  to `Shell::toggle`. There is no mobile sheet, and the page behind the
  columns is the flat sidebar color (React paints a gradient).
- **Auth blocks emit and wait.** React awaits an `onSubmit` promise.
  Here each block is an entity that emits a `Submit` event, locks its
  fields, and stays locked until the host calls `succeed(cx)` or
  `fail(message, cx)`. `reset(window, cx)` empties it for a second use,
  where React remounts. The fields are reachable (`email_input()` and
  the like) to prefill or focus. Email validity is `is_email`, a loose
  shape check, in place of the browser's. In-card links ("Sign up",
  "Forgot password?") are ghost buttons, since they are commands. The
  success check and the error line appear without the drawn stroke and
  the shake.
- **Onboarding answers one step at a time.** `OnboardingBlock` emits
  `Step { id, values }` and waits for `advance(cx)` or `fail(message,
  cx)`; after the last step it emits `Complete` with every value, which
  is not awaited. Values are `OnboardingValue::Text` or `Flag`, in
  declared order. The step menu and a select field are a button that
  opens a menu, and the step menu is left out of a one-step flow. A URL
  is checked loosely: a scheme, a colon and a rest. Typed fields survive
  going back because each field keeps its own state, not through a draft
  store.
- **Account panels are told their lists.** `LinkedAccountsBlock` and
  `PasskeyManagerBlock` emit a request and wait for `settle(cx)` or
  `fail(message, cx)`; the host then hands over the new list with
  `set_identities` or `set_passkeys`, and rows fold in and out. A
  passkey's dates arrive already written out (`created`, `last_used`),
  since the crate formats no dates. The delete confirmation names the
  passkey, and the add button reads "Add passkey". The passkey sign-in
  button's fingerprint takes the button's ink, not React's pink.
- **An accent is a fill on the button.** React sets custom properties on
  the card and a class string on its primary action. Here `AuthAccent`
  hands `Button::fill` a background and an ink. GPUI's gradient takes two
  stops, so Exegia's three are flattened to its outer two; hover lightens
  the fill with a white veil, standing in for `brightness-110`.
- **The auth flow is an entity with directives.** `AuthFlow` owns the
  six blocks and emits one `AuthFlowEvent` per attempt. The host answers
  with `complete(user, cx)`, `begin_verification(identifier, channel,
  cx)`, `go_to_step(step, cx)`, `succeed(cx)` or `fail(message, cx)`,
  where React returns a directive from a handler. A block is emptied
  each time the flow arrives at it. There are no flow ids: make a second
  `AuthFlow` for a second surface. `AuthSession` is an entity the app
  shares, not a store; attach it with `.session(&session, cx)` and
  signing it out returns the flow to login. `renderStep`, the per-step
  prop overrides and the flow-level `status` and `error` have no
  counterpart: reach a block through `flow.login()` and the like.
  `AuthUser` carries no `metadata` or `initials`. One screen folds away
  as the next opens, where React morphs the card.
- **The scaffold is one layout, not compound parts.** `ScaffoldLayout`
  takes the rail, tabs, panels and inspector through builder methods, and
  `Scaffold` holds what they share. Every panel and tab has an id. A
  hidden panel is not drawn (React keeps it mounted), and panels appear
  and leave without a morph; the inspector slide, the tab spotlight and
  the tabs stepping aside are animated. The seam's Swap, Expand and Close
  buttons show while the pointer is over the panel, with no collapsed
  toggle and no linger timer. `on_swap` runs after the scaffold has
  recorded the swap; the cards trade places without the host's help.
- **The resource sidebar is an entity.** `ResourceSidebar` owns the tree,
  the open rows, the selection and the rename field; there is no
  controlled form. It emits `Select`, `Move` and `Rename` after applying
  each change, and nothing waits on the host: to refuse one, call
  `set_items` with the old tree. `menu` adds rows under Rename instead of
  replacing the menu, and the actions button and row icons are fixed. A
  long label truncates (no marquee), hover tints each row (no pill
  travelling between rows), and rows do not slide when the order changes.
  The menu opens by pointer only.
- **The profile card holds no state of its own.** There is no store keyed
  by card id: the host passes `collapsed` and `loading`, and the fold
  animates between the two. An action's `on_select` returns nothing, so
  the host sets `loading` itself while a command runs. The card does not
  read a surrounding panel; pass the rail's fold to `collapsed`. The menu
  opens from the stock dropdown, placed with `anchor`, and sizes to its
  rows (there is no `menuWidth: "card"`). No sound cues.
- **The AI panel takes the composer, not its props.** `AiPanel::new(id,
  &composer)` renders an entity the host owns and subscribes to. `locked`
  disables that composer when it changes, and re-enables it when it
  clears. The lock shows only on a locked panel (React draws it on an
  unlocked one). The panel's prompt list is `PromptList`, since
  `SuggestedPrompts` is the composed folding list. The banners are drawn
  by the block: there is no `Alert` atom yet. `VersionHistoryEntry` takes
  its timestamp already formatted.
- **The corpus navigator folds its picker in place.** Under 1100px of its
  own width the picker opens beneath the location bar from the Browse
  button, where React slides a drawer in from the side or the bottom. The
  open state lives on `CorpusNavigation` (`picker_open`), and Cancel or a
  commit closes it. The first frame assumes the wide layout, then measures.
  The reading is passed as children, not as a render function over the
  state: read the entity instead.
- **A research answer shows only the commands it can run.** Copy, Share
  and Add to list each appear when their handler is set, where React draws
  all three regardless. A source or author is text or a `Reference` chip;
  there is no `IResearchReference` object with a favicon preview.
- **A recommendation is one card.** `Recommendation` folds on its own
  heading, so there is no `Recommendation.Group` accordion: stack cards in a
  column. Its state belongs to the owner, and the running mark is the stock
  spinner without the step number inside it.
- **An attachment shows what it is given.** `Attachment` takes a kind, a
  title and an optional thumbnail; it does not read files, play video or
  sound, or render a PDF page. "Play", "Download" and "Open link" are buttons
  that call `on_action` (a link with a `url` opens it in the browser). The
  chip has no hover preview: show `.preview()` in a popover where one is
  wanted.
- **Markdown is GPUI Component's renderer.** `Markdown` draws its preview with
  `TextView::markdown`, so headings, lists, code and links take that
  component's styling, not React's tag map. Its view switch is the
  `SegmentedToggle`, and "Copy markdown" writes to the clipboard itself.
- **Tables are rows of shared-width cells.** GPUI has no table element, so
  `FilterTable` and `RecordsTable` lay each row out as flex cells. They do not
  scroll sideways and have no sticky columns or header; long cells are cut
  short. `FilterTable` takes each row as its status and a list of cells, not
  a typed record.
- **Data pieces keep their own view state.** The code block's Code and Diff
  switch, the filter table's status, the insight page and its picked share
  live in the component, keyed by its id, and are reported through
  `on_…` callbacks. `RecordsTable` and `SegmentedToggle` also take the value
  from outside (`selected`, `value`).
- **An insight has no trend snapshot yet.** `Insight` carries its summary,
  figures, share breakdown and follow-up; the line chart waits for the chart
  port. Its summary is plain text, so React's inline `InsightEntity` dot is
  not available.
- **Tag and code colors come from the theme.** React's `--tag-*` and
  `--code-*` values are not copied: a tag takes a status or chart color at
  three strengths, keywords take `info` and strings `success`. The code
  block's header shows the file name without the file icon.
- **A verse is one run of text.** `Verse` takes its reference, words, glosses
  and notes as segments and lays them out as a single wrapped paragraph, so
  React's `VerseSpan` and `VerseNote` are its `span` and `note` builders. GPUI
  sets one type size per paragraph: the reference and the note marks are told
  apart by color and weight, not by a raised, smaller size, and a gloss has a
  solid underline, not a dotted one.
- **Text popovers open at the pointer.** `TextSelection`, `TextPopover` and a
  verse's popovers float above the point that was clicked or where the
  selection ended, on frosted glass. They take the focus, and close on a press
  outside or on Escape. `TextSelection` reads the window's text selection, so
  its children must hold selectable text (`TextView::…selectable(true)`).
- **The reader's selection card is content, not a popover.** React's
  `SelectionPopover` is a hover card around its trigger; `SelectionCard` goes
  inside whichever popover the reader opens. Its `⌘J` is shown as a hint: bind
  the shortcut in the application.
- **A glass rim is set side by side.** `GlassSpec::edges` takes a
  `GlassEdges`: `all` for an even rim, then `x` (left and right), `y` (top
  and bottom) or a single side, each with a width and a brightness. Corners
  blend the two sides they join. The rim is part of the lens, so a surface
  with no lens, such as `GlassSpec::blur`, has none.
- **Glass needs the patched GPUI.** `glass` is a default feature that calls a
  backdrop pass added in `vendor/` (Metal only). An application outside this
  workspace must copy the `[patch.crates-io]` entries, or turn the feature
  off; glass then paints its tint as a translucent fill, as it does off
  macOS.
- **`Bubble` takes slots, not children.** React reads the variant from context
  and styles the tail with a sibling selector. Here `Bubble` owns `header`,
  `message`, `actions` and the reactions, and the caller says which bubble of
  a run keeps its `tail`.
- **The reaction pill is frosted glass**, as in React. When a reaction's
  count changes its emoji swells and settles and the number rolls to the new
  value, up for one more and down for one fewer.
- **Avatar initials are tinted.** The stock avatar colors initials by name, so
  one person always gets one color. React's fallback is neutral. The audio
  ring breathes instead of spinning, and the verified mark is Reicon's
  outline rather than the filled rosette.
- **`InputField` shows the error only while invalid**, and the description
  otherwise. React's version shows neither unless both are set.

- **Card insets are owned by `Card`.** React pads each part and corrects the
  seams with descendant selectors. Here `Card` takes `header`, `content` and
  `footer` slots and resolves the insets itself. `Card::divided` stands in
  for `border-b` / `border-t` on the parts, and `CardFrame` takes its cards
  through `.card(…)` so it can merge their borders with its own.
- **One header type serves both frames.** `CardFrameHeader` heads a
  `CardFrame` and a `Frame`; each sets its own insets.
- **No `Text` link variant.** Use GPUI Component's `Link` for a URL and a
  `Button` for anything in-app.
- **Badge `focus` variants are omitted.** They reference `--focus`, which
  `theme.css` does not define.
- **Invert badge text on a light page** uses the foreground. React's
  `text-invert-foreground` is near-white there.
- **Fonts are bundled, and differ from React's.** Interface text and headings
  are set in Allo (React: Inter and Figtree); reading text, through
  `Text::serif`, in Caudex. `corpora_ui::init` loads both from
  `assets/fonts`, so neither has to be installed.
