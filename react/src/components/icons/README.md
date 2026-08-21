# Corpora file icons

Fourteen React SVG components covering seven file formats in two visual families.
Every icon carries **both** a light and a dark artwork layer and picks one at render
time with CSS — no props, no context, no JavaScript.

Generated from `exegia-prod.sketch` → page `icons`. Do not hand-edit the `.tsx`
files; regenerate them from Sketch instead (see [Regenerating](#regenerating)).

## Usage

```tsx
import { FileBadgeTei, FileWordmarkPdf } from '@/components/icons';

<FileBadgeTei />                        // 64×64, follows the OS colour scheme
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

Each icon renders two `<g data-theme-layer>` groups and shows exactly one. The
rules live in [`theme.ts`](./theme.ts) and are inlined into every SVG, so the
components work with no stylesheet import.

Resolution order, later rules winning:

1. **`prefers-color-scheme`** — follows the operating system by default.
2. **`.dark` class** on any ancestor — Tailwind `darkMode: 'class'`.
3. **`[data-theme="light"|"dark"]`** on any ancestor — explicit override.

```tsx
<div data-theme="dark">
  <FileBadgeTei />   {/* dark artwork regardless of OS setting */}
</div>
```

Because the switch is pure CSS it is SSR-safe and cannot flash the wrong theme
on hydration.

## Notes

- **Text is outlined.** Labels are vector paths, not live `<text>`, so the
  icons do not depend on *TikTok Sans Display* being installed.
- **IDs are namespaced** per component and per theme layer (`tei-badge-l-…`),
  so gradients and filters never collide when several icons share a page.
- **Both layers ship in every component.** A hidden layer costs bytes but
  guarantees the two themes are pixel-faithful to Sketch, including the glass
  blur that the light badges use and the dark badges deliberately omit.
- **Filter regions were widened** to the SVG default (`-50% / 200%`). Sketch
  exports tight regions such as `height="76.2%"` that clip real geometry in
  spec-compliant renderers — the third sheet line disappears without this.

## Regenerating

1. In Sketch, edit the symbols on the `icons` page of `exegia-prod`.
2. Re-export each symbol to SVG, and export each label inside an exact-size
   bounding box to PDF (the PDF round-trip is what outlines the type).
3. Run the generator, which splices the outlined labels into the SVG, namespaces
   the IDs, widens the filter regions and emits the `.tsx` files.

Colours are driven by the `file/*` swatches in the Sketch document, so a palette
change there propagates to every symbol before export.
