# Corpora file icons

Fourteen React SVG components covering seven file formats in two visual families.
Every icon carries **both** a light and a dark artwork layer and picks one with
Tailwind's `dark` variant — no props, no context, no JavaScript.

Generated from `exegia-prod.sketch` → page `icons`, then simplified (dead defs
removed, light/dark-identical defs shared, ids stripped). Do not hand-edit the
`.tsx` files; regenerate them from Sketch instead (see
[Regenerating](#regenerating)).

## Usage

```tsx
import { FileBadgeTei, FileWordmarkPdf } from '@/components/icons';

<FileBadgeTei />                        // 64×64, follows the app's dark class
<FileBadgeTei size={128} />             // any size
<FileWordmarkPdf title={null} />        // decorative: aria-hidden, no accessible name
<FileBadgeTei title="TEI source file" /> // custom accessible name
<FileBadgeTei className="shrink-0" />   // merged with the internal class
```

All remaining props are forwarded to the root `<svg>`.

## Components

| Format | Badge | Wordmark |
| --- | --- | --- |
| TEI | `FileBadgeTei` | `FileWordmarkTei` |
| XML | `FileBadgeXml` | `FileWordmarkXml` |
| TXT | `FileBadgeTxt` | `FileWordmarkTxt` |
| TF | `FileBadgeTf` | `FileWordmarkTf` |
| CFM | `FileBadgeCfm` | `FileWordmarkCfm` |
| PDF | `FileBadgePdf` | `FileWordmarkPdf` |
| Corpus | `FileBadgeCorpus` | `FileWordmarkCorpus` |

**Badge** — colour-coded pill overlapping the left edge of the sheet.
**Wordmark** — `.EXT` set along the bottom of the sheet.

## Theming

Each icon renders two `<g data-theme-layer>` groups and shows exactly one via
Tailwind's `dark` variant: the light layer is `dark:hidden`, the dark layer
`hidden dark:inline`. Whatever drives `dark:` in the app drives the icons —
here that is `@custom-variant dark (&:is(.dark *))` in `index.css`, so the
icons follow the `.dark` class exactly like every other component, with no
inline stylesheet and no media query of their own.

To force a theme on one subtree, scope the class:

```tsx
<div className="dark">
  <FileBadgeTei />   {/* dark artwork regardless of the app theme */}
</div>
```

Because the switch is pure CSS it is SSR-safe and cannot flash the wrong theme
on hydration. The `data-theme-layer` attributes stay on the groups as styling
and test hooks.

## Notes

- **Text is outlined.** Labels are vector paths, not live `<text>`, so the
  icons do not depend on *TikTok Sans Display* being installed.
- **IDs are namespaced** per component and per theme layer (`tei-badge-l-…`),
  so gradients and filters never collide when several icons share a page.
  Only referenced defs carry ids; decorative group ids were stripped.
- **Both layers ship in every component,** but defs that are identical in
  both themes (sheet geometry, badge plates, label glyphs) exist once and are
  referenced from both layers — a `<defs>` entry resolves regardless of which
  layer it sits in, hidden or not. Theme-specific gradients and filters stay
  per layer, so the two themes remain pixel-faithful to Sketch.
- **Filter regions were widened** to the SVG default (`-50% / 200%`). Sketch
  exports tight regions such as `height="76.2%"` that clip real geometry in
  spec-compliant renderers — the third sheet line disappears without this.

## Regenerating

1. In Sketch, edit the symbols on the `icons` page of `exegia-prod`.
2. Re-export each symbol to SVG, and export each label inside an exact-size
   bounding box to PDF (the PDF round-trip is what outlines the type).
3. Run the generator, which splices the outlined labels into the SVG, namespaces
   the IDs, widens the filter regions and emits the `.tsx` files.
4. Run `bun scripts/simplify-icons.mjs` (from `react/`), which swaps the layer
   switching onto Tailwind's `dark` variant, drops dead and duplicated defs,
   strips unreferenced ids and default-value attributes, and verifies that
   every remaining `url(#…)` / `href="#…"` reference resolves.

Colours are driven by the `file/*` swatches in the Sketch document, so a palette
change there propagates to every symbol before export.
