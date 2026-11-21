# corpora-ui — gpui

The GPUI counterpart of the React library in `../react`, built on
[GPUI Kit](https://gpui-kit.com) (`gpui-kit` 0.10: GPUI, GPUI Base, GPUI
Component and the default icons behind one dependency).

```sh
cargo run -p corpora-ui --example gallery                      # open the gallery
cargo run -p corpora-ui --example gallery -- --snapshot <dir>  # render it to PNGs, no window
cargo test -p corpora-ui
cargo clippy -p corpora-ui --all-targets
```

## Layout

```text
gpui/
└── crates/corpora-ui/
    ├── src/
    │   ├── foundations/   # tokens: color, theme, radius, motion, shadow, size, typography
    │   ├── atoms/         # basic elements
    │   └── composed/      # atoms assembled into one piece of interface
    ├── examples/gallery.rs
    └── tests/         # atoms.rs, composed.rs
```

`blocks/` will sit beside `composed/` as it is ported.

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
| `Text`, `Heading`, `Paragraph`, `Span` | `Text` | this crate |
| `Label` (text level) | `Text::label` with a `LabelLevel` | this crate |
| `Loader` | `Loader` | this crate |
| `Avatar` | `Avatar`, `AvatarUser` | this crate, on the stock avatar |
| `Bubble` and its parts | `Bubble`, `BubbleReaction` | this crate |
| `Reference` | `Reference` | this crate, on the stock button and hover card |
| `InputField` | `InputField` | this crate, on the stock input |
| `SourceChip`, `SelectChip` | `Chip`, `SelectChip` | this crate |
| `Label` (form), `Kbd`, `Separator`, `Skeleton`, `Spinner` | same names | GPUI Component |

Not ported yet: `Texture`, the text-selection popovers, the `glass` button
variant and the emoji picker behind a bubble's add-reaction button.

### Composed

| React | GPUI |
| --- | --- |
| `User.Info`, `User.Pill`, `User.Message` | `UserInfo`, `UserPill`, `UserMessage` |
| `AI.Avatar`, `AI.Message` | `AiIdentity`, `AiMessage` |
| `StreamingText` | `StreamingText`, `StreamToken` |
| `SuggestedPrompt`, `SuggestedPrompts` | same names |
| `ActionBar`, `EmojiActionBar` | same names |
| `Logo` | `Logo` |
| `PasswordInput` | `PasswordInput`, `password_strength` |
| `SocialProviders` | `SocialProviders` |
| `SendHint` | `SendHint` |

```rust
use corpora_ui::composed::{AiMessage, StreamingText, UserMessage};

UserMessage::new("message-41", "Where does this reading come from?")
    .user(AvatarUser::named("Grace", "Hopper").role("Editor"))
    .description("2 min ago")

AiMessage::new("message-42")
    .child(StreamingText::from_text("message-42-text", [answer]).streaming(is_streaming))
```

Not ported yet: `Verse` (it needs the text-selection popovers), the research
answer, the chat composer, attachments, markdown, charts, the flowchart,
recommendation and insight cards, the tables, the reader, corpus navigation
and the tree.

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

- **Composed components do not animate height.** GPUI cannot tween to an
  intrinsic size, so the suggestions panel and the strength checklist appear
  at once. A folded `Logo` fades its wordmark, then drops it from the layout.
- **`SuggestedPrompts` is not tucked under a composer.** React pulls its
  bottom edge behind the composer pill; that belongs to the composer, which is
  not ported.
- **`SocialProviders` draws every provider as an outline button.** React
  fills Apple's black. The Apple and GitHub marks are Lucide's outlines, not
  Remix's filled ones.
- **`EmojiActionBar` is the quick row only.** "More emoji" calls your handler;
  there is no full picker.
- **`ActionBar` takes commands, not components**, and drops a separator that
  has nothing on one side of it.
- **`SendHint` shows the platform's keys**: ⌘↵ on macOS, Ctrl+Enter elsewhere.
- **`StreamingText` fades words in without the blur**, and wraps word by
  word, so a long citation chip moves to the next line whole.
- **`PasswordInput` uses the stock show/hide toggle** and plays no sound.

- **Register `corpora_ui::Assets`.** It serves GPUI Component's default icons
  plus the few the atoms add (`assets.rs`). With the stock asset source alone,
  `Reference` and a verified `Avatar` draw a blank where their icon belongs.
- **`Bubble` takes slots, not children.** React reads the variant from context
  and styles the tail with a sibling selector. Here `Bubble` owns `header`,
  `message`, `actions` and the reactions, and the caller says which bubble of
  a run keeps its `tail`.
- **The reaction pill is opaque.** React's is liquid glass; here it is the
  popover surface with a border.
- **Avatar initials are tinted.** The stock avatar colors initials by name, so
  one person always gets one color. React's fallback is neutral. The audio
  ring breathes instead of spinning, and the verified mark is Lucide's
  `badge-check` outline rather than the filled rosette.
- **`InputField` shows the error only while invalid**, and the description
  otherwise. React's version shows neither unless both are set.

- **Card insets are owned by `Card`.** React pads each part and corrects the
  seams with descendant selectors. Here `Card` takes `header`, `content` and
  `footer` slots and resolves the insets itself.
- **No `Text` link variant.** Use GPUI Component's `Link` for a URL and a
  `Button` for anything in-app.
- **Badge `focus` variants are omitted.** They reference `--focus`, which
  `theme.css` does not define.
- **Invert badge text on a light page** uses the foreground. React's
  `text-invert-foreground` is near-white there.
- **Fonts are used only when installed.** Inter and Figtree are not bundled;
  without them text falls back to the system UI font.
