# Anchored popover hook — design

**Date:** 2026-10-03
**Area:** `react/src/components/atoms/text/selection/`
**Status:** approved in conversation, awaiting written review

## Goal

Show a popover at the coordinates of a user event — a text selection, a
click, or a hover — inside any "view" element, from anywhere in the app,
**without wrapping the target elements in a `PopoverTrigger`**. A consumer
holds a `ref` to the view, calls one hook, and renders one popup.

Success criteria:

- `Verse`, `Text.Paragraph` and arbitrary consumer views can show an anchored
  popover with no per-element wrapper component.
- Positioning, collision handling, portal, scroll tracking, Escape and
  outside-press dismissal all come from Base UI — no manual coordinate math
  and no third-party positioning library.
- Any component can read the current selection text or close the popover by
  instance id through the store, following the repo's keyed-atom pattern.

## Non-goals

- Rich-text editing toolbars (formatting commands). The hook exposes the
  selected text and a payload; what the popup does with it is the consumer's.
- Touch long-press as a distinct trigger. Native touch selection already
  fires `selectionchange`, which the `selection` trigger handles.
- Keeping backwards compatibility for `TextSelection`, `HighlightPopover`,
  `TextClickPopover`, or the selection props on `Text.Heading` /
  `Text.Paragraph`. These are removed (see §6).

## Why this is cheap

Base UI's `Popover.Positioner` accepts `anchor` as a **virtual element**
(`{ getBoundingClientRect(): DOMRect; contextElement?: Element }`), and the
library's `PopoverPopup` wrapper already forwards `anchor`. A controlled
`Popover.Root` with no `Popover.Trigger` can therefore be positioned against
a selection `Range`'s rect, a clicked element's rect, or a pointer point,
while Base UI handles flip/shift, the portal, `autoUpdate` scroll tracking
(via `contextElement`), focus and dismissal.

## 1. Public API

All of this lives in `react/src/components/atoms/text/selection/` and is
exported from `atoms/index.ts` (and so from the package root).

### `useAnchoredPopover<TPayload>(options)`

```ts
interface IUseAnchoredPopoverOptions<TPayload = unknown> {
  /** The view. Listeners attach here; selections outside it are ignored. */
  ref: RefObject<HTMLElement | null>
  /** Instance id. Defaults to `useId()`; an explicit id outlives the component. */
  id?: string
  /** Which events open the popover. Default `["selection"]`. */
  trigger?: TAnchoredPopoverTrigger | TAnchoredPopoverTrigger[]
  /** click/hover only: which descendants count as targets. Default: any element. */
  match?: string | ((element: Element) => boolean)
  /** Resolve the payload handed to the popup when it opens. */
  getPayload?: (context: IAnchoredPopoverContext) => TPayload
  /** click/hover only. `"target"` (default) anchors to the matched element's rect, `"pointer"` to the event point. */
  anchorTo?: "target" | "pointer"
  /** selection only. Shorter selections do not open the popover. Default 1. */
  minSelectionLength?: number
  /** hover only. Default 300 ms open, 150 ms close. */
  hoverDelay?: number
  hoverCloseDelay?: number
  onOpenChange?: (open: boolean, reason: TAnchoredPopoverReason) => void
}

type TAnchoredPopoverTrigger = "selection" | "click" | "hover"
type TAnchoredPopoverReason =
  | "selection" | "click" | "keyboard" | "hover"   // opened by
  | "collapse" | "toggle" | "leave" | "dismiss" | "show" | "hide"  // changed by

interface IAnchoredPopoverContext {
  target: Element | null   // matched element (click/hover) or the selection's common ancestor
  text: string             // selected text, or target.textContent for click/hover
  event: Event | null      // null for imperative `show()`
}

interface IUseAnchoredPopoverResult<TPayload> {
  open: boolean
  text: string
  payload: TPayload | undefined
  /** The matched element. Kept in the hook, never in the store. */
  target: Element | null
  /** Virtual element for Base UI, or null when closed. */
  anchor: TVirtualAnchor | null
  /** Open from any event: an element, a rect, or a point. */
  show: (anchor: Element | DOMRect | { x: number; y: number }, payload?: TPayload) => void
  hide: () => void
  /** Spread onto `<AnchoredPopover>`. */
  popoverProps: IAnchoredPopoverControlProps<TPayload>
}
```

### `<AnchoredPopover>`

```tsx
<AnchoredPopover
  {...popover.popoverProps}
  side="top"            // Base UI Positioner side/align/offsets, forwarded
  align="center"
  variant="glass"       // "default" | "glass"; glass routes to PopoverGlass
  glassVariant="frosted"
  className="max-w-64"
>
  {({ text, payload, close, open, setOpen }) => <Toolbar … />}
  {/* or a plain ReactNode */}
</AnchoredPopover>
```

- A controlled Base UI `Popover.Root` with **no trigger**. `open` and
  `onOpenChange` come from `popoverProps`; Base UI's own dismissals
  (Escape, outside press) flow back through `onOpenChange` so the store
  stays in sync.
- Renders the library's `PopoverPopup` (or `PopoverGlass`) with
  `anchor={popover.anchor}`. Keeps the `data-selection-popover` attribute
  the old popup emitted so existing styling hooks keep working.
- The render-function props are `ITextPopoverRenderProps` (`open`, `setOpen`,
  `close`) extended with `text` and `payload`. `ITextPopoverRenderProps` is
  kept under its current name so `Verse`'s `renderChapterPopover` signature
  does not change.
- Hover mode: the popup's `onPointerEnter` cancels the pending close timer and
  `onPointerLeave` restarts it, so a hover popover with buttons stays usable.

### State hooks and atoms

```ts
useAnchoredPopoverState(id)    // { open, text, rect, payload }
useAnchoredPopoverActions(id)  // { show(rect, text, payload?), hide() } — write-only, never re-renders
showAnchoredPopoverAtom(id), hideAnchoredPopoverAtom(id)
anchoredPopoverOpenAtom(id), anchoredPopoverTextAtom(id), anchoredPopoverRectAtom(id), anchoredPopoverPayloadAtom(id)
removeAnchoredPopoverInstance(id)
```

## 2. Event handling (inside the hook)

Listeners attach in an effect once `ref.current` exists and are removed on
unmount or when `trigger`/`match` change. All timers are cleared on unmount.

**selection**

- `document` `selectionchange` → ignore unless the range's common ancestor is
  inside `ref.current`. Collapsed range or
  `text.trim().length < minSelectionLength` → `hide()` with reason
  `"collapse"`.
- Opening is deferred to the next `pointerup` (mouse/touch) or `keyup`
  (Shift+Arrow selections) so the popover does not flicker mid-drag. A
  pending open is dropped if the selection collapses first.
- Anchor: `range.getBoundingClientRect()` wrapped as a virtual element with
  `contextElement = ref.current`. Centered on the whole selection, including
  multi-line ranges.

**click**

- `click` on the view; walk up from `event.target` to the first element
  matching `match` that is still inside the view. No match → ignore. Match ==
  the currently open target → `hide()` with reason `"toggle"`.
- `keydown` `Enter` / `Space` on a matched target that is the event target
  (i.e. it is focused) opens the same way, reason `"keyboard"`; `Space`
  prevents default so the page does not scroll.
- If the matched target is an `<a href>`, the click's default is prevented
  only when `getPayload` returns a non-nullish payload — a link without
  popover content keeps navigating. Modifier clicks (ctrl/meta/shift/middle)
  are never intercepted.
- Anchor: the target's rect (`anchorTo: "target"`) or a zero-size rect at the
  pointer (`"pointer"`).

**hover**

- `pointerover` → if the target matches and differs from the current one,
  start the open timer (`hoverDelay`). `pointerout` to an element outside the
  target → start the close timer (`hoverCloseDelay`). Popup pointer-enter
  cancels the close timer (see §1).
- `pointerdown` anywhere in the view cancels a pending hover open so a click
  trigger on the same view wins.

**imperative**

- `show(anchor, payload)` accepts an `Element`, a `DOMRect`, or `{ x, y }`
  and opens with reason `"show"`; `hide()` closes with reason `"hide"`.

Resolving the anchor is one helper, `toAnchorRect(input, view)` in
`utils.ts`, shared by every trigger.

## 3. State (repo pattern)

`anchored-popover-atom.ts` uses `createKeyedFamilies("anchoredPopover")`
from `lib/keyed-atom.ts`. Every atom carries `debugLabel`
`anchoredPopover/<id>/<name>`.

| atom | type | notes |
| --- | --- | --- |
| `open` | `boolean` | |
| `text` | `string` | selected text or target text |
| `rect` | `{ x, y, width, height } \| null` | plain snapshot; **no DOM nodes in the store** |
| `payload` | `unknown` | consumer data |

Actions are write-only atoms: `show(id, { rect, text, payload })`,
`hide(id)`. The hook rebuilds the virtual element from `rect` +
`ref.current` on render, so remote readers only ever see plain data. The
`target` element lives in a hook ref.

Instances keyed by `useId()` are dropped with
`removeAnchoredPopoverInstance(id)` on unmount; an explicit id persists
until the consumer removes it.

## 4. Files

New / rewritten in `react/src/components/atoms/text/selection/`:

- `anchored-popover.tsx` — `AnchoredPopover`
- `use-anchored-popover.ts` — `useAnchoredPopover`
- `use-anchored-popover-state.ts` — `useAnchoredPopoverState` / `useAnchoredPopoverActions`
- `anchored-popover-atom.ts` — atoms and actions
- `utils.ts` — `toAnchorRect`, `rangeWithin(view)`, `closestMatch(target, match, view)`
- `type.ts` — all interfaces above; imports no atoms (stays dependency-free)
- `index.ts` — explicit named exports (never `export *` from the atom module)
- `__tests__/anchored-popover.test.tsx`, `__tests__/anchored-popover-atom.test.tsx`

Deleted: `click-popover.tsx`, `popover.tsx`, `selection.tsx`,
`selection-atom.ts`, `use-selection.ts`, `__tests__/click-popover.test.tsx`,
`__tests__/text-selection.test.tsx`.

## 5. Migrations

**`Text.Heading` / `Text.Paragraph`** (`atoms/text/heading.tsx`,
`paragraph.tsx`, `type.ts`): drop the `TextSelection` wrapper and its props.
`THeadingProps` and `TParagraphProps` become `Omit<TTextProps, "type">`.
`text/type.ts` stops importing from the selection folder.

**`Verse`** (`composed/verse/verse.tsx`, `types.ts`): **public props are
unchanged** — `chapter`, `chapterPopover`, `renderChapterPopover`, `href`,
`size`, and `VerseSpan` / `VerseNote` `popover` / `renderPopover` /
`popoverProps`. Internals change to one popup per verse:

- `Verse` holds the view `ref` and calls
  `useAnchoredPopover({ trigger: "click", match: "[data-verse-popover]", getPayload })`.
- A `VerseContext` carries `size` (as today) plus a registry
  `Map<string, { popover?, renderPopover?, popoverProps? }>`. `VerseSpan`,
  `VerseNote` and the chapter link register their content under a `useId()`
  key in a layout effect and unregister on unmount.
- They render plain `Text` with `data-verse-popover={key}`, `role="button"`
  (chapter keeps its `<a href>` semantics and gets no role), `tabIndex={0}`,
  `aria-haspopup="dialog"`, `aria-expanded={open && target === self}`, plus
  the current underline/subscript classes.
- `getPayload` reads `target.dataset.versePopover` and returns the registry
  entry; `AnchoredPopover`'s render function calls `renderPopover(renderProps)`
  or returns `popover`.
- A chapter without popover content renders the plain link exactly as today
  (`verse.test.tsx` asserts `role` is null on it).

**Barrels and type catalog**: `atoms/index.ts` exports `AnchoredPopover`,
`useAnchoredPopover`, the state hooks and the public atoms; the
`TextClickPopover` / `TextSelection` / `HighlightPopover` lines go.
`atoms/type.ts` keeps `export type * from "./text/selection/type"`.
`components/types.ts` replaces the five removed selection prop types in
`TAtomsProps` with `IAnchoredPopoverProps` and `IUseAnchoredPopoverOptions`.

**In-flight rename fixes** (the working tree already moved
`atoms/text-selection/` → `atoms/text/selection/` and `types.ts` → `type.ts`
without updating imports): `./types` → `./type` in `text/*.tsx`,
`../text-selection` → `./selection` / `../../atoms/text/selection` in
`text/type.ts`, `verse/*`, `atoms/index.ts`; `./atoms/types` → `./atoms/type`
in `components/types.ts`.

**Dependency**: remove `@omsimos/react-highlight-popover` from
`react/package.json` (`cd react && bun remove @omsimos/react-highlight-popover`).

**Docs and demos**: `registry/demos/text-demo.tsx` becomes the hook
showcase — one container with `trigger: ["selection", "click"]`, the
selection popup showing the selected text and the click popup showing the
clicked word. `content/atoms/text.mdx` drops `TextClickPopover`, documents
`useAnchoredPopover` + `AnchoredPopover` with a props table, and notes the
removal. `content/composed/verse.mdx` is unchanged in API; its prose gains
one line that spans and notes are keyboard-activatable.

## 6. Breaking changes

- Removed exports: `TextSelection`, `HighlightPopover`, `TextClickPopover`,
  `useSelection`, `selectionAtom` and the `set*SelectionAtom` family, and the
  types `ITextSelectionProps`, `IHighlightPopoverProps`,
  `THighlightPopoverPrimitiveProps`, `ISelectionRenderProps`,
  `ISelectionState`, `ISelectionPosition`, `TSelectionPopoverComponent`,
  `TSelectionStateUpdate`, `IUseSelectionOptions`, `IUseSelectionResult`.
- `Text.Heading` / `Text.Paragraph` no longer accept selection/popover props.
- `ITextPopoverRenderProps` and `ITextClickPopoverProps`'s successor
  (`IAnchoredPopoverProps`) are the migration path; the docs page shows the
  before/after.

## 7. Error handling and edge cases

- `ref.current` is null → no listeners, no throw; the effect re-runs when
  the ref is populated (deps include `ref.current` via a layout-effect
  re-check on mount).
- Selection that starts inside the view and ends outside → the common
  ancestor is outside → ignored, and any open popover hides with
  `"collapse"`.
- Base UI outside-press on `mousedown` while the user starts a new selection
  closes the popover; the subsequent `pointerup` reopens it on the new range.
  This is the intended "follows the selection" behavior.
- `getPayload` is not wrapped in try/catch — a throwing resolver is a
  consumer bug and should surface.
- SSR: the hook touches `document` only inside effects.

## 8. Testing

`cd react && bun test` (happy-dom, `@testing-library/react`):

- **atoms**: `show`/`hide` by id on a fresh `createStore()`; two ids are
  independent; `removeAnchoredPopoverInstance` resets.
- **click trigger**: clicking a matched child opens and the popup receives
  the payload; clicking an unmatched child does nothing; clicking the open
  target again closes; `Enter` on the focused target opens; `Escape` closes;
  a matched `<a href>` without payload is not `preventDefault`ed.
- **hover trigger**: with mocked timers, `pointerover` opens after
  `hoverDelay`; `pointerout` closes after `hoverCloseDelay`; pointer entering
  the popup cancels the close.
- **selection trigger**: build a `Range` over a text node inside the view,
  `addRange`, dispatch `selectionchange` then `pointerup`, expect open and
  `text`. If happy-dom's `Selection` proves too thin for this, the test falls
  back to asserting the hook's `selectionchange` handler via `show()`-level
  behavior, and the limitation is recorded in the test file.
- **imperative**: `show({ x, y })` opens with a zero-size rect; `hide()` closes.
- **regressions**: `atoms/text/__tests__/text.test.tsx` and
  `composed/verse/__tests__/verse.test.tsx` pass unchanged — the verse test's
  "chapter, span and note each open their own popover on click" is the
  acceptance test for the Verse migration.
- `cd react && make check` (tsc -b + eslint) green; `bun run build:docs`
  succeeds.
