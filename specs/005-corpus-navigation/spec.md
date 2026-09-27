# 005 · Schema-driven corpus navigation

Status: proposed implementation. Target: `exegia/corpora-ui`, `react/`, based on `dev` commit `9ddc5f2265328d7ca65e057d3f644f70077606a7` (v4.0.0). This specification describes a reusable library feature, not a corpus-web route or a replacement docs Overview page.

## Goal

A reader can browse or enter a location in Bible, Quran, Book of Mormon, library books, booklets and papers without learning a different navigation system. A schema determines available levels; a component's available width determines its presentation. Preserve reading position during exploration and provide a return action after committing a jump.

## Atomic design and reuse contract

| Layer | Responsibility | Reuse / new work |
| --- | --- | --- |
| Atoms / `components/ui` and `components/atoms` | Generic interaction, styling, icons and accessibility primitives; no corpus logic | Reuse Button, Input/InputGroup, Breadcrumb, Kbd, Tabs, Separator, ScrollArea, Skeleton, Empty/Alert, Dialog/Drawer/Sheet and Command. A numbered cell is a configured Button, not a new ChapterButton/VerseButton/AyahButton family. Add a generic atom only after demonstrating an uncovered primitive need. |
| Composed / `components/composed/corpus-navigation` | LocationBar, HierarchyPicker, LocationGrid and ReferenceCommand; typed schema/location contracts and Jotai hooks | One implementation per role, configured by schema. Reuse Tree for suitable hierarchy presentation, not a second tree engine. |
| Block / `components/blocks/corpus-navigation` | CorpusNavigator orchestrates the compositions across inline, drawer and compact sheet modes | Reuse existing overlays. Offer slots/callbacks for corpus choice, reading surface and context. A wide docs example composes existing Scaffold parts; do not create another application shell. |

Existing `components/composed/reader` exports SelectionPopover, SelectionHighlight, AppliedMark and ApplyToast; it is not a Reader. `components/composed/verse` contains Verse. Use those where applicable in demonstrations; the library does not own corpus fetching, scripture text, rendering engines, routing or an annotation system.

Tree is a reuse candidate with boundaries: its navigation mode may promote the first level into headings, and its TOC behavior may derive hash navigation. Explicitly preserve selectable corpus nodes and route all committed jumps through the navigation actions. A small generic Tree fix is acceptable when verified necessary; a parallel Tree implementation is not.

## Module conventions

```text
react/src/components/composed/corpus-navigation/
  index.ts                         # explicit named public exports
  types.ts                         # dependency-free schema/location/props/state/actions
  corpus-navigation-atom.ts        # module-level keyed Jotai atoms/actions
  use-corpus-navigation.ts         # binding and controlled-prop lifecycle
  use-corpus-navigation-state.ts   # public read/action hooks
  utils.ts                         # pure resolution, validation and path helpers
  adapters/                        # schema presets and format/parse capabilities
  location-bar.tsx
  hierarchy-picker.tsx
  location-grid.tsx
  reference-command.tsx
  __tests__/
react/src/components/blocks/corpus-navigation/
  index.ts
  types.ts
  corpus-navigator.tsx
  use-navigation-presentation.ts   # container measurements only
  utils.ts                         # only block-specific pure helpers, if needed
  __tests__/
```

One default component per TSX file and named public barrels, matching the current primitive convention. Feature helpers stay colocated. Reuse `src/lib/keyed-atom.ts` and the existing `src/state/store.ts`; do not add a second store or provider. Do not create empty helper files, a global catch-all utilities folder, or separate copies for each corpus. The file tree is proposed; adopt equivalent existing names when extending a real module.

## Schema and location contract

| Corpus | Path | Required behavior |
| --- | --- | --- |
| Bible | Book → Chapter → optional Verse | Canon, order, aliases, bounds and versification come from data/edition. |
| Quran | Surah → optional Ayah | Surah is the chapter. No redundant Book or Chapter selector. Juz may be an alternate index. |
| Book of Mormon | Book → Chapter → optional Verse | Same compositions, different data; include a long book such as Alma. |
| Library book | optional Section → optional Chapter → Page or stable anchor → optional Paragraph | Omit absent levels. Do not promise stable pages in reflowable content without an edition page map. |
| Booklet | optional Chapter → Page → optional Paragraph | A page-only booklet bypasses chapter UI. |
| Paper | Page → optional Paragraph | Optional headings are an alternate index; paragraphs require a reliable extraction map. |

Define stable corpus ID, edition ID, node IDs, ordered levels, labels, aliases, direction, availability and bounds. Treat the canonical anchor as stable identity; display reference strings and breadcrumbs are derived. Accept hierarchy data and resolver/search callbacks from consumers. Presets define labels and capabilities, not a hardcoded corpus database. Page numbering may have offsets or non-Arabic labels; never infer leaf counts or silently clamp an invalid reference. A custom schema must work without modifying corpus-specific UI branches.

## Shared state and hooks

Use module-level families keyed by `navigatorId`, through the existing shared ExegiaProvider store. Proposed public hooks: `useCorpusNavigationState(id)`, `useCorpusNavigationActions(id)`, and binding `useCorpusNavigation(...)`. Reads and actions are separate; action-only consumers must not subscribe to the entire state. Give atoms feature/id/name debug labels; explicitly export only intended public atoms/hooks/types.

Store committed location, draft location, query, active result, picker state, expansion and bounded return history only where owned. Derive breadcrumbs and validity. Prefer per-node selectors for rows. Reuse existing Tree state rather than duplicating expanded/selected state: either project a single controlled source into Tree with its existing write gates, or let Tree own expansion and expose it by its ID. Document that decision.

Unnamed instances use React.useId and clean up on unmount. Explicit IDs survive remount until `removeCorpusNavigationInstance(id)`; document logout/teardown. External Jotai stores supplied to ExegiaProvider remain supported. Controlled location/data props are authoritative, with the existing owned-state/write-gate pattern preventing inline-object projection loops. No per-navigator provider, mutable singleton across all navigators, or persistence to localStorage by default.

Separate draft from committed navigation. Select ancestors/leaves without moving the reader, then commit an exact valid anchor. Preserve the original anchor for Return. Resolver failures or stale async results cannot replace the current location. Define cancellation/request identity for racing searches/resolution; controlled callbacks fire once and await parent ownership rather than writing competing state. Changing corpus or edition clears incompatible draft/results and resolves or explains invalid anchors.

## Acceptance criteria

### Navigation and schema

- [ ] AC1: all six schemas plus a custom schema render only supported levels; canonical ordering, bounds, localized labels and missing paragraph/page maps are respected.
- [ ] AC2: browsing changes draft only; commit changes the anchor exactly once; Cancel preserves the current location; Return restores the previous valid anchor.
- [ ] AC3: direct reference matches are separate from text search; aliases and partial/invalid references produce deterministic results or actionable guidance. Valid long ranges are reachable without rendering thousands of controls.
- [ ] AC4: multiple navigator IDs and external stores are isolated; same-ID observers/actions coordinate; controlled props remain authoritative without loops; lifecycle cleanup is verified.
- [ ] AC5: no component duplicates Tree, overlay focus behavior, Button, search primitives, provider/store, or reader rendering that already exists or belongs to the host.

### Responsive, keyboard and themes

- [ ] AC6: container width chooses wide inline, medium drawer and compact sheet; demonstrate 1440, 768, 390 and 320 px plus a narrow panel inside a wide viewport. Resize preserves location/draft/focus and never mounts two active dialogs.
- [ ] AC7: optional Cmd/Ctrl K opens only the intended navigator, with shortcut ownership/opt-out for multiple instances; ignore composing/editing events where appropriate. Arrows, Enter, Escape, Home/End follow the selected primitive's semantics. Closing returns focus; commit moves/announces the location through a host callback without stealing focus unexpectedly.
- [ ] AC8: 44 px touch targets, visible focus, meaningful accessible names, tested modal semantics, RTL text/reference isolation, 200% zoom and keyboard/virtual-keyboard-safe scrolling.
- [ ] AC9: inherit semantic theme tokens, fonts, radii, density, Lucide icon conventions, provider direction and portal destinations. Verify light/dark and two existing accents. Do not copy Sketch hex colors, Avenir/Georgia typography, or initialize a new shadcn preset.
- [ ] AC10: use existing motion utilities/motion-react and reduced-motion conventions. Target sheet 240 ms, hierarchy 160 ms, commit 180 ms; reduced motion is immediate. No GSAP dependency, decorative reader animations, or replay on unrelated state changes.

### Error states and distribution

- [ ] AC11: loading, empty/no-match, invalid reference, missing index, failed resolution/retry and corpus/edition changes preserve the last committed location. Stale requests are ignored and duplicate commits are guarded.
- [ ] AC12: documented public exports work from a real packed-package consumer with the single library stylesheet and shared provider. Jotai stays a peer; focused/root imports preserve atom and component identity.
- [ ] AC13: Fumapress stories/docs cover all schemas, controlled mode, external hook control, responsive embedding, themes, RTL and recovery; source paths and imports are verified against the actual public API.

## Design traceability

Source: `Corpus-Navigation.sketch`, created in this chat and verified open through Sketch's native scripting interface. No Sketch MCP endpoint was available. Screenshots are reference states, not an implemented keyboard/search system. Existing Corpora themes override illustrative Sketch styling.

| Artboard | Native ID | Visual |
| --- | --- | --- |
| Wide · Bible study | `CD6A4AA0-B0E1-456E-88C3-037E29F1712E` | [Wide](assets/01-wide.png) |
| Wide · Quick jump | `020B2589-743E-47BA-97E5-463F88AA49DF` | [Search](assets/02-quick-jump.png) |
| Compact · Quran reading | `25EF5986-6D48-4EB8-A137-D1AC5EF9CAD2` | [Compact](assets/03-mobile.png) |
| Compact · Choose location | `EAABB244-735A-4CCA-B3B1-44F90D8A8AF0` | [Picker](assets/04-mobile-picker.png) |
| Compact · After jump | `4C9FA646-057C-4D36-AFE8-6431A49F0973` | [Return](assets/05-mobile-jump.png) |
| Medium · Bible reading | `095047F7-E37E-415A-9627-747C1787CAFC` | [Medium](assets/06-medium.png) |
| Schema · Six corpus adapters | `E8D9CBCC-F41D-4E3F-A10F-E6C5C404009B` | [Schemas](assets/07-schemas.png) |
| Behavior · Responsive and motion | `7A84AE08-EBB2-4947-B2A1-9E0433516D21` | [Behavior](assets/08-behavior.png) |

[Editable Sketch document](assets/Corpus-Navigation.sketch). [Research and design notes](design-notes.md) contain the official Logos, JW Library, Bible Gateway, Quran.com, Church of Jesus Christ, Apple Books and Kindle sources. Async, controlled-state, packaging and error-state requirements above are engineering extensions to the mockups, not claims that Sketch already implements them.

## Non-goals

No application routing/data backend, corpus text bundle, annotation/audio engine, generic reader rewrite, unrelated primitive migration, new theme, or replacement shell. Fumapress documentation is the existing publishing system; do not add Mintlify or `docs.json`. Do not implement component functionality in this specification branch.
