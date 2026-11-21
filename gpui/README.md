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
    │   └── atoms/         # basic elements
    ├── examples/gallery.rs
    └── tests/atoms.rs
```

`composed/` and `blocks/` will sit beside `atoms/` as they are ported.

## Usage

Call `corpora_ui::init(cx)` once at startup, in place of `gpui_kit::init`. It
initializes GPUI Kit and installs the Corpora light and dark themes.

```rust
use corpora_ui::atoms::{Badge, Button, ButtonKinds as _, Card, CardHeader};

Card::new()
    .header(CardHeader::new("Members").description("People with access"))
    .content(member_list)
    .footer(Button::new("invite").primary_kind(cx).label("Invite"))
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
| `Button` | `Button` + `ButtonKind` | GPUI Component, kinds in this crate |
| `Badge` | `Badge` | this crate |
| `Card`, `CardHeader`, `CardPanel`, `CardFooter` | `Card`, `CardHeader` | this crate |
| `Text`, `Heading`, `Paragraph` | `Text` | this crate |
| `Loader` | `Loader` | this crate |
| `Label`, `Kbd`, `Separator`, `Skeleton`, `Spinner` | same names | GPUI Component |

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
