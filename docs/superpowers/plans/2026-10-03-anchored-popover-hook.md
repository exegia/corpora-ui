# Anchored Popover Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the wrapper-based text popovers with one hook (`useAnchoredPopover`) and one trigger-less popup (`AnchoredPopover`) that open at a selection, a clicked element or a hovered element inside any `ref`'d view.

**Architecture:** A controlled Base UI `Popover.Root` with no `Popover.Trigger` is positioned through the library's `PopoverPopup anchor` prop with a *virtual element* (`{ getBoundingClientRect, contextElement }`), so Base UI owns flip/shift/portal/scroll tracking/Escape/outside-press. The hook attaches DOM listeners to the consumer's view element, resolves an anchor rect plus a payload, and keeps plain state (`open`, `text`, `rect`, `payload`) in keyed Jotai atoms so any component can read or close a popover by id. `Verse` migrates to the hook; `Text.Heading`/`Text.Paragraph` become plain text; the third-party highlight-popover dependency is removed.

**Tech Stack:** React 19, `@base-ui/react` 1.8 Popover, Jotai keyed families (`react/src/lib/keyed-atom.ts`), Tailwind v4, `bun test` + happy-dom + `@testing-library/react` + `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-10-03-anchored-popover-hook-design.md`

## Global Constraints

- All commands run from `react/` (`cd /home/emmanuel/Projects/corpora-apps/corpora-ui/react`). `bun test` must run there (bunfig preload). `make check` = `tsc -b --noEmit` + eslint; plain `tsc --noEmit` checks nothing.
- Dependencies install only in `react/` (`cd react && bun add …`). Never at the repo root.
- State pattern (react/CLAUDE.md): keyed atom families via `createKeyedFamilies`, every atom has `debugLabel` `anchoredPopover/<id>/<name>`, mutations are write-only action atoms, the barrel exports atoms **explicitly** (never `export *` from the atom module), no DOM nodes in the store.
- Naming: interfaces `I*`, type aliases `T*`, files kebab-case, `type.ts` (singular) per folder; types in `type.ts` import no atoms.
- Commit subjects carry an emoji (`✨ feat:`, `♻️ refactor:`, `🐛 fix:`, `📝 docs:`, `✅ test:`) and end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Tests: assert async-revealed content with `findBy*`; drive clicks with `@testing-library/user-event` (a bare `fireEvent.click` does not toggle native inputs in happy-dom); no fake timers in bun — use short real delays and `waitFor`.
- Keep `data-selection-popover=""` on the rendered popup (existing styling hook).
- `Verse`'s public props do not change (`chapter`, `href`, `size`, `chapterPopover`, `renderChapterPopover`, and `VerseSpan`/`VerseNote` `popover` / `renderPopover` / `popoverProps`).

## Review Focus

1. **Selection that ends outside the view** (drag from inside the paragraph past its edge): the popover must not open, and an open one must close with reason `"collapse"`. → test added in Task 5.
2. **Clicking the open target again** must close, not flicker closed-then-open (Base UI's outside-press closes on `pointerdown`, our `click` handler runs after). → `details.cancel()` path + test in Task 3.
3. **Modifier/middle click on a verse chapter link** must navigate, never open the popover. → test in Task 3 (`isModifiedClick`).
4. **A `VerseSpan` without `popover`** (the hero renders one) stays a plain span: no `role`, no `tabIndex`, not clickable. → test in Task 8.
5. **Unmount while a hover timer is pending** must not call a setter on a dead component or leave a timer running. → test in Task 4.

---

## File map

Create in `react/src/components/atoms/text/selection/`:

| File | Responsibility |
| --- | --- |
| `type.ts` (rewrite) | Every public type. No runtime imports except `type` imports. |
| `utils.ts` | Pure DOM helpers: `toAnchorRect`, `rectToVirtualAnchor`, `selectionRangeWithin`, `closestMatch`, `isModifiedClick`. |
| `anchored-popover-atom.ts` | Keyed atoms + `show`/`hide` actions + `removeAnchoredPopoverInstance`. |
| `use-anchored-popover-state.ts` | `useAnchoredPopoverState(id)`, `useAnchoredPopoverActions(id)`. |
| `use-anchored-popover.ts` | `useAnchoredPopover(options)` — listeners, timers, anchor, `show`/`hide`, `popoverProps`. |
| `anchored-popover.tsx` | `AnchoredPopover` — trigger-less controlled popup. |
| `index.ts` (rewrite) | Explicit named exports. |
| `__tests__/utils.test.tsx`, `__tests__/anchored-popover-atom.test.tsx`, `__tests__/anchored-popover.test.tsx` | Tests. |

Delete: `click-popover.tsx`, `popover.tsx`, `selection.tsx`, `selection-atom.ts`, `use-selection.ts`, `__tests__/click-popover.test.tsx`, `__tests__/text-selection.test.tsx`.

Modify: `atoms/text/{heading,paragraph,type}.tsx|ts`, `composed/verse/{verse.tsx,type.ts}`, `atoms/index.ts`, `components/type.ts`, `registry/demos/text-demo.tsx`, `content/atoms/text.mdx`, `content/composed/verse.mdx`, `package.json` (remove dep).

---

### Task 1: Types and pure DOM helpers

**Files:**
- Rewrite: `react/src/components/atoms/text/selection/type.ts`
- Create: `react/src/components/atoms/text/selection/utils.ts`
- Test: `react/src/components/atoms/text/selection/__tests__/utils.test.tsx`

**Interfaces:**
- Produces (used by every later task): all types below; `toAnchorRect(input): IAnchorRect`, `rectToVirtualAnchor(rect, contextElement?, live?): IVirtualAnchor`, `selectionRangeWithin(view): Range | null`, `closestMatch(start, match, view): Element | null`, `isModifiedClick(event): boolean`.

The old `type.ts` still exports the legacy types the old components import. This task **appends** the new types and keeps the legacy ones until Task 10 deletes them, so the tree compiles at every commit.

- [ ] **Step 1: Write the failing utils test**

Create `react/src/components/atoms/text/selection/__tests__/utils.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test"
import {
  closestMatch,
  isModifiedClick,
  rectToVirtualAnchor,
  selectionRangeWithin,
  toAnchorRect,
} from "../utils"

function view(html: string): HTMLDivElement {
  const el = document.createElement("div")
  el.innerHTML = html
  document.body.append(el)
  return el
}

describe("toAnchorRect", () => {
  test("a point becomes a zero-size rect", () => {
    expect(toAnchorRect({ x: 10, y: 20 })).toEqual({ x: 10, y: 20, width: 0, height: 0 })
  })
  test("a rect-like object is copied", () => {
    expect(toAnchorRect({ x: 1, y: 2, width: 3, height: 4 })).toEqual({ x: 1, y: 2, width: 3, height: 4 })
  })
  test("an element reads its bounding box", () => {
    const el = view("<b>x</b>").firstElementChild as HTMLElement
    el.getBoundingClientRect = () => ({ x: 5, y: 6, width: 7, height: 8 }) as DOMRect
    expect(toAnchorRect(el)).toEqual({ x: 5, y: 6, width: 7, height: 8 })
  })
})

describe("rectToVirtualAnchor", () => {
  test("serves the stored rect and carries the context element", () => {
    const ctx = view("")
    const anchor = rectToVirtualAnchor({ x: 1, y: 2, width: 3, height: 4 }, ctx)
    const rect = anchor.getBoundingClientRect()
    expect([rect.x, rect.y, rect.width, rect.height, rect.left, rect.top, rect.right, rect.bottom]).toEqual([1, 2, 3, 4, 1, 2, 4, 6])
    expect(anchor.contextElement).toBe(ctx)
  })
  test("prefers the live rect when one is supplied", () => {
    const anchor = rectToVirtualAnchor({ x: 1, y: 2, width: 3, height: 4 }, null, () => ({ x: 9, y: 9, width: 1, height: 1 }) as DOMRect)
    expect(anchor.getBoundingClientRect().x).toBe(9)
  })
})

describe("closestMatch", () => {
  test("walks up to the first matching ancestor inside the view", () => {
    const root = view('<p data-term="a"><em id="inner">x</em></p><span id="plain">y</span>')
    expect(closestMatch(root.querySelector("#inner"), "[data-term]", root)?.getAttribute("data-term")).toBe("a")
    expect(closestMatch(root.querySelector("#plain"), "[data-term]", root)).toBeNull()
  })
  test("accepts a predicate", () => {
    const root = view('<p><b id="b">x</b></p>')
    expect(closestMatch(root.querySelector("#b"), (el) => el.tagName === "P", root)?.tagName).toBe("P")
  })
  test("without a matcher any element inside the view counts, including the view", () => {
    const root = view("<i>x</i>")
    expect(closestMatch(root.firstElementChild, undefined, root)).toBe(root.firstElementChild)
    expect(closestMatch(root, undefined, root)).toBe(root)
    expect(closestMatch(document.body, undefined, root)).toBeNull()
  })
  test("a text node resolves to its parent element", () => {
    const root = view("<i>x</i>")
    expect(closestMatch(root.firstElementChild!.firstChild, undefined, root)?.tagName).toBe("I")
  })
})

describe("selectionRangeWithin", () => {
  test("returns the range only when it lies inside the view and is not collapsed", () => {
    const root = view("<p>Selectable corpus text</p>")
    const other = view("<p>Elsewhere</p>")
    const text = root.firstElementChild!.firstChild as Text
    const range = document.createRange()
    range.setStart(text, 0)
    range.setEnd(text, 10)
    const sel = document.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
    expect(selectionRangeWithin(root)?.toString()).toBe("Selectable")
    expect(selectionRangeWithin(other)).toBeNull()
    range.collapse(true)
    expect(selectionRangeWithin(root)).toBeNull()
  })
})

describe("isModifiedClick", () => {
  test("flags non-primary buttons and modifier keys", () => {
    expect(isModifiedClick(new MouseEvent("click"))).toBe(false)
    expect(isModifiedClick(new MouseEvent("click", { button: 1 }))).toBe(true)
    expect(isModifiedClick(new MouseEvent("click", { metaKey: true }))).toBe(true)
    expect(isModifiedClick(new MouseEvent("click", { ctrlKey: true }))).toBe(true)
    expect(isModifiedClick(new MouseEvent("click", { shiftKey: true }))).toBe(true)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /home/emmanuel/Projects/corpora-apps/corpora-ui/react && bun test src/components/atoms/text/selection/__tests__/utils.test.tsx`
Expected: FAIL — `Cannot find module '../utils'`.

- [ ] **Step 3: Append the new types to `type.ts`**

Add to the end of `react/src/components/atoms/text/selection/type.ts` (keep everything already there; add the two imports at the top):

```ts
import type { RefObject } from "react"
import type { PopoverRoot } from "@base-ui/react/popover"
import type { TPopoverGlassProps } from "@/components/ui/popover-glass"
```

```ts
/* ------------------------------------------------------------------ */
/* Anchored popover                                                    */
/* ------------------------------------------------------------------ */

export type TAnchoredPopoverTrigger = "selection" | "click" | "hover"

/** Why the popover opened (first row) or changed (second row). */
export type TAnchoredPopoverReason =
  | "selection" | "click" | "keyboard" | "hover"
  | "collapse" | "toggle" | "leave" | "dismiss" | "show" | "hide"

/** Plain viewport rect — what the store holds; never a DOM node. */
export interface IAnchorRect {
  x: number
  y: number
  width: number
  height: number
}

/** Base UI's virtual-element shape, declared locally so consumers need no floating-ui import. */
export interface IVirtualAnchor {
  getBoundingClientRect: () => DOMRect
  contextElement?: Element
}

export type TAnchoredPopoverMatch = string | ((element: Element) => boolean)

/** What `show()` accepts: an element, a `Range`, a rect, or a point. */
export type TAnchorInput = Element | Range | DOMRect | IAnchorRect | { x: number; y: number }

export interface IAnchoredPopoverContext {
  /** The matched element (click/hover), the selection's common ancestor, or null. */
  target: Element | null
  /** The selected text, or the target's `textContent`. */
  text: string
  /** Null for imperative `show()`. */
  event: Event | null
}

export interface IUseAnchoredPopoverOptions<TPayload = unknown> {
  /** The view. Listeners attach here; selections outside it are ignored. */
  ref: RefObject<HTMLElement | null>
  /** Instance id. Defaults to `useId()`; an explicit id outlives the component. */
  id?: string
  /** Which events open the popover. Default `["selection"]`. */
  trigger?: TAnchoredPopoverTrigger | TAnchoredPopoverTrigger[]
  /** click/hover only: which descendants count as targets. Default: any element. */
  match?: TAnchoredPopoverMatch
  /** Resolve the payload handed to the popup when it opens. */
  getPayload?: (context: IAnchoredPopoverContext) => TPayload
  /** click/hover only. `"target"` (default) anchors to the matched element, `"pointer"` to the event point. */
  anchorTo?: "target" | "pointer"
  /** selection only. Shorter selections do not open. Default 1. */
  minSelectionLength?: number
  /** hover only. Default 300 ms. */
  hoverDelay?: number
  /** hover only. Default 150 ms. */
  hoverCloseDelay?: number
  onOpenChange?: (open: boolean, reason: TAnchoredPopoverReason) => void
}

export interface IAnchoredPopoverState {
  open: boolean
  text: string
  rect: IAnchorRect | null
  payload: unknown
}

export interface IShowAnchoredPopoverArgs {
  rect: IAnchorRect
  text: string
  payload?: unknown
}

export interface IAnchoredPopoverActions {
  show: (args: IShowAnchoredPopoverArgs) => void
  hide: () => void
}

/** What the hook hands to `<AnchoredPopover>` — spread `popoverProps`. */
export interface IAnchoredPopoverControlProps<TPayload = unknown> {
  id: string
  open: boolean
  anchor: IVirtualAnchor | null
  text: string
  payload: TPayload | undefined
  /** Base UI details arrive on dismissals; absent for the render-prop `close`/`setOpen`. */
  onOpenChange: (open: boolean, details?: PopoverRoot.ChangeEventDetails) => void
  /** Hover mode: keep the popup open while the pointer is inside it. */
  onPopupPointerEnter: () => void
  onPopupPointerLeave: () => void
}

export interface IUseAnchoredPopoverResult<TPayload = unknown> {
  open: boolean
  text: string
  payload: TPayload | undefined
  /** The matched element. Lives in the hook, never in the store. */
  target: Element | null
  anchor: IVirtualAnchor | null
  show: (anchor: TAnchorInput, payload?: TPayload) => void
  hide: () => void
  popoverProps: IAnchoredPopoverControlProps<TPayload>
}

export interface IAnchoredPopoverRenderProps<TPayload = unknown> extends ITextPopoverRenderProps {
  text: string
  payload: TPayload | undefined
}

/** Positioner/popup props a consumer may set on `<AnchoredPopover>`. */
export type TAnchoredPopoverPopupProps = Omit<
  ComponentProps<typeof PopoverPopup>,
  "anchor" | "children" | "onPointerEnter" | "onPointerLeave" | "onMouseDown"
>

type TAnchoredPopoverVariantProps =
  | { variant?: "default"; glassVariant?: never }
  | { variant: "glass"; glassVariant?: TPopoverGlassProps["glassVariant"] }

export type IAnchoredPopoverProps<TPayload = unknown> = IAnchoredPopoverControlProps<TPayload> &
  TAnchoredPopoverPopupProps &
  TAnchoredPopoverVariantProps & {
    children?: ReactNode | ((props: IAnchoredPopoverRenderProps<TPayload>) => ReactNode)
  }
```

`ComponentProps`, `ReactNode` and `PopoverPopup` are already imported at the top of the file. `ITextPopoverRenderProps` (`{ open, setOpen, close }`) already exists in this file — keep it; it is public and `Verse` uses it.

- [ ] **Step 4: Create `utils.ts`**

```ts
import type { IAnchorRect, IVirtualAnchor, TAnchorInput, TAnchoredPopoverMatch } from "./type"

const ZERO: IAnchorRect = { x: 0, y: 0, width: 0, height: 0 }

function copyRect(rect: { x: number; y: number; width: number; height: number }): IAnchorRect {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
}

/** Snapshot any anchor input as a plain rect. A point becomes a zero-size rect. */
export function toAnchorRect(input: TAnchorInput): IAnchorRect {
  if (typeof Element !== "undefined" && input instanceof Element) {
    return copyRect(input.getBoundingClientRect())
  }
  if (typeof Range !== "undefined" && input instanceof Range) {
    // happy-dom implements this; guard anyway so a thin DOM never throws.
    return typeof input.getBoundingClientRect === "function"
      ? copyRect(input.getBoundingClientRect())
      : ZERO
  }
  if ("width" in input && "height" in input) return copyRect(input)
  return { x: input.x, y: input.y, width: 0, height: 0 }
}

/**
 * Wrap a rect as the virtual element Base UI positions against. `live`
 * (an element's or range's own `getBoundingClientRect`) wins when given, so
 * the popup follows the text through scroll and reflow; the stored rect is
 * the fallback for point anchors and remote readers.
 */
export function rectToVirtualAnchor(
  rect: IAnchorRect,
  contextElement?: Element | null,
  live?: () => DOMRect | null
): IVirtualAnchor {
  return {
    contextElement: contextElement ?? undefined,
    getBoundingClientRect: () => {
      const current = live?.()
      if (current) return current
      const { x, y, width, height } = rect
      return {
        x, y, width, height,
        top: y, left: x, right: x + width, bottom: y + height,
        toJSON: () => ({ x, y, width, height }),
      } as DOMRect
    },
  }
}

function toElement(node: EventTarget | Node | null | undefined): Element | null {
  if (!node || !(node instanceof Node)) return null
  return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
}

/** The current non-collapsed selection range, if its common ancestor sits inside `view`. */
export function selectionRangeWithin(view: Element): Range | null {
  const selection = view.ownerDocument.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null
  const range = selection.getRangeAt(0)
  const ancestor = toElement(range.commonAncestorContainer)
  if (!ancestor || !view.contains(ancestor)) return null
  return range
}

/**
 * Walk up from an event target to the first element matching `match`, stopping
 * at the view. With no matcher any element inside the view counts — the view
 * itself included, since a click on bare text targets the view.
 */
export function closestMatch(
  start: EventTarget | Node | null | undefined,
  match: TAnchoredPopoverMatch | undefined,
  view: Element
): Element | null {
  let element = toElement(start)
  if (!element) return null
  if (match === undefined) {
    return element === view || view.contains(element) ? element : null
  }
  while (element && element !== view) {
    if (typeof match === "string" ? element.matches(match) : match(element)) return element
    element = element.parentElement
  }
  return null
}

/** Non-primary button or any modifier — the browser's own behavior should win. */
export function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}
```

- [ ] **Step 5: Run the test**

Run: `bun test src/components/atoms/text/selection/__tests__/utils.test.tsx`
Expected: all PASS. If `selectionRangeWithin` fails because happy-dom's `Selection.addRange` is a no-op, print `document.getSelection()?.rangeCount` in the test; if it is `0`, mark that single test `test.skip` with the comment `// happy-dom: addRange is a no-op; covered by the hook test's manual dispatch` and continue — do not change the implementation.

- [ ] **Step 6: Type-check and commit**

Run: `make check` — expected clean (the new types are additive).

```bash
git add src/components/atoms/text/selection/type.ts src/components/atoms/text/selection/utils.ts src/components/atoms/text/selection/__tests__/utils.test.tsx
git commit -m "$(cat <<'EOF'
✨ feat(selection): anchored popover types and DOM helpers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Keyed atoms and state hooks

**Files:**
- Create: `react/src/components/atoms/text/selection/anchored-popover-atom.ts`
- Create: `react/src/components/atoms/text/selection/use-anchored-popover-state.ts`
- Test: `react/src/components/atoms/text/selection/__tests__/anchored-popover-atom.test.tsx`

**Interfaces:**
- Consumes: `IAnchorRect`, `IAnchoredPopoverState`, `IShowAnchoredPopoverArgs`, `IAnchoredPopoverActions` from Task 1; `createKeyedFamilies` from `@/lib/keyed-atom`.
- Produces: `anchoredPopoverOpenAtom(id)`, `anchoredPopoverTextAtom(id)`, `anchoredPopoverRectAtom(id)`, `anchoredPopoverPayloadAtom(id)`, `anchoredPopoverStateAtom(id)` (read-only), `showAnchoredPopoverAtom(id)` (write `IShowAnchoredPopoverArgs`), `hideAnchoredPopoverAtom(id)` (write, no args), `removeAnchoredPopoverInstance(id)`, `useAnchoredPopoverState(id): IAnchoredPopoverState`, `useAnchoredPopoverActions(id): IAnchoredPopoverActions`.

- [ ] **Step 1: Write the failing atom test**

```tsx
import { describe, expect, test } from "bun:test"
import { createStore } from "jotai"
import {
  anchoredPopoverStateAtom,
  hideAnchoredPopoverAtom,
  removeAnchoredPopoverInstance,
  showAnchoredPopoverAtom,
} from "../anchored-popover-atom"

const rect = { x: 1, y: 2, width: 3, height: 4 }

describe("anchored popover atoms", () => {
  test("show opens one instance with its rect, text and payload", () => {
    const store = createStore()
    store.set(showAnchoredPopoverAtom("a"), { rect, text: "lemma", payload: { id: 7 } })
    expect(store.get(anchoredPopoverStateAtom("a"))).toEqual({ open: true, text: "lemma", rect, payload: { id: 7 } })
    expect(store.get(anchoredPopoverStateAtom("b"))).toEqual({ open: false, text: "", rect: null, payload: undefined })
  })

  test("hide closes but keeps the last text and rect readable", () => {
    const store = createStore()
    store.set(showAnchoredPopoverAtom("a"), { rect, text: "lemma" })
    store.set(hideAnchoredPopoverAtom("a"))
    expect(store.get(anchoredPopoverStateAtom("a"))).toEqual({ open: false, text: "lemma", rect, payload: undefined })
  })

  test("removeAnchoredPopoverInstance forgets the instance", () => {
    const store = createStore()
    store.set(showAnchoredPopoverAtom("gone"), { rect, text: "x" })
    removeAnchoredPopoverInstance("gone")
    expect(store.get(anchoredPopoverStateAtom("gone")).open).toBe(false)
  })

  test("every atom carries a debug label", () => {
    expect(anchoredPopoverStateAtom("dbg").debugLabel).toBe("anchoredPopover/dbg/state")
    expect(showAnchoredPopoverAtom("dbg").debugLabel).toBe("anchoredPopover/dbg/show")
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover-atom.test.tsx`
Expected: FAIL — `Cannot find module '../anchored-popover-atom'`.

- [ ] **Step 3: Create `anchored-popover-atom.ts`**

```ts
/**
 * Per-instance state for `useAnchoredPopover`, keyed by popover id.
 *
 * Only plain data lives here (`open`, `text`, a rect snapshot, the payload) so
 * any component can read the current selection or close a popover by id. The
 * matched DOM element and the live anchor stay inside the hook.
 */
import { atom } from "jotai"
import { createKeyedFamilies } from "@/lib/keyed-atom"
import type { IAnchorRect, IAnchoredPopoverState, IShowAnchoredPopoverArgs } from "./type"

const { keyed, stateFamily, actionFamily, removeInstance } = createKeyedFamilies("anchoredPopover")

export const anchoredPopoverOpenAtom = stateFamily<boolean>("open", false)
export const anchoredPopoverTextAtom = stateFamily<string>("text", "")
export const anchoredPopoverRectAtom = stateFamily<IAnchorRect | null>("rect", null)
export const anchoredPopoverPayloadAtom = stateFamily<unknown>("payload", undefined)

export const anchoredPopoverStateAtom = keyed((id) => {
  const instance = atom<IAnchoredPopoverState>((get) => ({
    open: get(anchoredPopoverOpenAtom(id)),
    text: get(anchoredPopoverTextAtom(id)),
    rect: get(anchoredPopoverRectAtom(id)),
    payload: get(anchoredPopoverPayloadAtom(id)),
  }))
  instance.debugLabel = `anchoredPopover/${id}/state`
  return instance
})

export const showAnchoredPopoverAtom = actionFamily<[args: IShowAnchoredPopoverArgs]>(
  "show",
  (_get, set, id, { rect, text, payload }) => {
    set(anchoredPopoverRectAtom(id), rect)
    set(anchoredPopoverTextAtom(id), text)
    set(anchoredPopoverPayloadAtom(id), payload)
    set(anchoredPopoverOpenAtom(id), true)
  }
)

/** Closes only. Text and rect stay so remote readers keep the last selection and the exit animation keeps its anchor. */
export const hideAnchoredPopoverAtom = actionFamily<[]>("hide", (_get, set, id) => {
  set(anchoredPopoverOpenAtom(id), false)
})

export const removeAnchoredPopoverInstance = removeInstance
```

- [ ] **Step 4: Create `use-anchored-popover-state.ts`**

```ts
"use client"

import { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import {
  anchoredPopoverStateAtom,
  hideAnchoredPopoverAtom,
  showAnchoredPopoverAtom,
} from "./anchored-popover-atom"
import type { IAnchoredPopoverActions, IAnchoredPopoverState } from "./type"

/** Read a popover's state from anywhere under the provider. */
export function useAnchoredPopoverState(id: string): IAnchoredPopoverState {
  return useAtomValue(anchoredPopoverStateAtom(id))
}

/** Write-only handle — the caller never re-renders when the popover changes. */
export function useAnchoredPopoverActions(id: string): IAnchoredPopoverActions {
  const show = useSetAtom(showAnchoredPopoverAtom(id))
  const hide = useSetAtom(hideAnchoredPopoverAtom(id))
  return useMemo(() => ({ show, hide }), [show, hide])
}
```

- [ ] **Step 5: Run the test**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover-atom.test.tsx`
Expected: 4 PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/atoms/text/selection/anchored-popover-atom.ts src/components/atoms/text/selection/use-anchored-popover-state.ts src/components/atoms/text/selection/__tests__/anchored-popover-atom.test.tsx
git commit -m "$(cat <<'EOF'
✨ feat(selection): keyed anchored popover atoms and state hooks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `useAnchoredPopover` (click + imperative) and `AnchoredPopover`

**Files:**
- Create: `react/src/components/atoms/text/selection/use-anchored-popover.ts`
- Create: `react/src/components/atoms/text/selection/anchored-popover.tsx`
- Modify: `react/src/components/atoms/text/selection/index.ts` (add exports; keep the old ones for now)
- Test: `react/src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx`

**Interfaces:**
- Consumes: Task 1 types and helpers; Task 2 atoms; `Popover`, `PopoverPopup` from `@/components/ui/popover`; `PopoverGlass` from `@/components/ui/popover-glass`; `useStore` from `jotai`.
- Produces: `useAnchoredPopover<TPayload>(options: IUseAnchoredPopoverOptions<TPayload>): IUseAnchoredPopoverResult<TPayload>`; `AnchoredPopover<TPayload>(props: IAnchoredPopoverProps<TPayload>): ReactElement`.

The hook is written in full here, including the hover and selection effects as stubs that Tasks 4 and 5 fill in — so the file shape is fixed now and later tasks only edit two marked blocks.

- [ ] **Step 1: Write the failing click/imperative tests**

Create `react/src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx`:

```tsx
import { describe, expect, mock, test } from "bun:test"
import { useRef } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AnchoredPopover } from "../anchored-popover"
import { useAnchoredPopover } from "../use-anchored-popover"
import { useAnchoredPopoverActions } from "../use-anchored-popover-state"
import type { TAnchoredPopoverReason } from "../type"

type TOpenChange = (open: boolean, reason: TAnchoredPopoverReason) => void

function ClickHarness({
  onOpenChange,
  onLinkClick,
}: {
  onOpenChange?: TOpenChange
  onLinkClick?: (defaultPrevented: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string | null>({
    ref,
    id: "click-harness",
    trigger: "click",
    match: "[data-term]",
    getPayload: ({ target }) => (target as HTMLElement).dataset.term || null,
    onOpenChange,
  })
  return (
    <div ref={ref}>
      <span data-term="alpha" role="button" tabIndex={0}>alpha</span>{" "}
      <span data-term="beta" role="button" tabIndex={0}>beta</span>{" "}
      <span>plain</span>{" "}
      <a data-term="" href="#bare" onClick={(e) => onLinkClick?.(e.defaultPrevented)}>bare link</a>{" "}
      <a data-term="gamma" href="#gamma" onClick={(e) => onLinkClick?.(e.defaultPrevented)}>gamma link</a>
      <button type="button" onClick={() => popover.show({ x: 10, y: 20 }, "point")}>show at point</button>
      <AnchoredPopover {...popover.popoverProps}>
        {({ text, payload, close }) => (
          <div>
            <p>term:{payload}</p>
            <p>text:{text}</p>
            <button type="button" onClick={close}>Dismiss</button>
          </div>
        )}
      </AnchoredPopover>
    </div>
  )
}

function RemoteCloser() {
  const { hide } = useAnchoredPopoverActions("click-harness")
  return <button type="button" onClick={hide}>Remote close</button>
}

describe("useAnchoredPopover · click", () => {
  test("a matched click opens with the payload and text; unmatched clicks are ignored", async () => {
    const user = userEvent.setup()
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<ClickHarness onOpenChange={onOpenChange} />)
    expect(screen.queryByText("term:alpha")).toBeNull()

    await user.click(screen.getByText("alpha"))
    expect(await screen.findByText("term:alpha")).toBeTruthy()
    expect(screen.getByText("text:alpha")).toBeTruthy()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "click")

    await user.click(screen.getByText("plain"))
    // Still the same popover: an unmatched click neither switches nor closes it.
    expect(screen.getByText("term:alpha")).toBeTruthy()
  })

  test("clicking another target switches; clicking the open target closes", async () => {
    const user = userEvent.setup()
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<ClickHarness onOpenChange={onOpenChange} />)

    await user.click(screen.getByText("alpha"))
    await screen.findByText("term:alpha")
    await user.click(screen.getByText("beta"))
    expect(await screen.findByText("term:beta")).toBeTruthy()

    await user.click(screen.getByText("beta"))
    await waitFor(() => expect(screen.queryByText("term:beta")).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "toggle")
  })

  test("Enter on a focused target opens; Escape closes", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    screen.getByText("beta").focus()
    await user.keyboard("{Enter}")
    expect(await screen.findByText("term:beta")).toBeTruthy()

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByText("term:beta")).toBeNull())
  })

  test("the render-prop close dismisses", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    await user.click(screen.getByText("alpha"))
    await user.click(await screen.findByText("Dismiss"))
    await waitFor(() => expect(screen.queryByText("term:alpha")).toBeNull())
  })

  test("a link only loses its default when it has popover content", async () => {
    const user = userEvent.setup()
    const onLinkClick = mock((_prevented: boolean) => {})
    render(<ClickHarness onLinkClick={onLinkClick} />)

    await user.click(screen.getByText("bare link"))
    expect(onLinkClick).toHaveBeenLastCalledWith(false)
    expect(screen.queryByText(/^term:/)).toBeNull()

    await user.click(screen.getByText("gamma link"))
    expect(onLinkClick).toHaveBeenLastCalledWith(true)
    expect(await screen.findByText("term:gamma")).toBeTruthy()
  })

  test("a modified click never opens", async () => {
    const user = userEvent.setup()
    render(<ClickHarness />)
    await user.keyboard("[MetaLeft>]")
    await user.click(screen.getByText("alpha"))
    await user.keyboard("[/MetaLeft]")
    expect(screen.queryByText("term:alpha")).toBeNull()
  })
})

describe("useAnchoredPopover · imperative and remote", () => {
  test("show() opens at a point and a remote hide() closes by id", async () => {
    const user = userEvent.setup()
    render(
      <>
        <ClickHarness />
        <RemoteCloser />
      </>
    )
    await user.click(screen.getByText("show at point"))
    expect(await screen.findByText("term:point")).toBeTruthy()

    await user.click(screen.getByText("Remote close"))
    await waitFor(() => expect(screen.queryByText("term:point")).toBeNull())
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx`
Expected: FAIL — `Cannot find module '../anchored-popover'`.

- [ ] **Step 3: Create `use-anchored-popover.ts`**

```ts
"use client"

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAtomValue, useSetAtom, useStore } from "jotai"
import type { PopoverRoot } from "@base-ui/react/popover"
import {
  anchoredPopoverOpenAtom,
  anchoredPopoverStateAtom,
  hideAnchoredPopoverAtom,
  removeAnchoredPopoverInstance,
  showAnchoredPopoverAtom,
} from "./anchored-popover-atom"
import type {
  IAnchorRect,
  IAnchoredPopoverContext,
  IUseAnchoredPopoverOptions,
  IUseAnchoredPopoverResult,
  TAnchorInput,
  TAnchoredPopoverReason,
  TAnchoredPopoverTrigger,
} from "./type"
import {
  closestMatch,
  isModifiedClick,
  rectToVirtualAnchor,
  selectionRangeWithin,
  toAnchorRect,
} from "./utils"

const NATIVE_INTERACTIVE = "button, a[href], input, textarea, select, summary"

/**
 * Opens a popover at a selection, a clicked element or a hovered element
 * inside the view behind `ref` — no `PopoverTrigger` wrapping required.
 * Spread `popoverProps` onto `<AnchoredPopover>` and render it anywhere.
 */
export function useAnchoredPopover<TPayload = unknown>(
  options: IUseAnchoredPopoverOptions<TPayload>
): IUseAnchoredPopoverResult<TPayload> {
  const {
    ref,
    id: idProp,
    trigger = "selection",
    match,
    getPayload,
    anchorTo = "target",
    minSelectionLength = 1,
    hoverDelay = 300,
    hoverCloseDelay = 150,
    onOpenChange,
  } = options
  const generatedId = useId()
  const id = idProp ?? generatedId
  const triggers = useMemo<TAnchoredPopoverTrigger[]>(
    () => (Array.isArray(trigger) ? trigger : [trigger]),
    // A fresh inline array each render must not re-bind listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Array.isArray(trigger) ? trigger.join(",") : trigger]
  )

  const store = useStore()
  const state = useAtomValue(anchoredPopoverStateAtom(id))
  const showInStore = useSetAtom(showAnchoredPopoverAtom(id))
  const hideInStore = useSetAtom(hideAnchoredPopoverAtom(id))

  // DOM-side state: never in the store.
  const [target, setTarget] = useState<Element | null>(null)
  const targetRef = useRef<Element | null>(null)
  const liveRectRef = useRef<(() => DOMRect | null) | null>(null)
  const reasonRef = useRef<TAnchoredPopoverReason | null>(null)
  const timers = useRef<{ open?: ReturnType<typeof setTimeout>; close?: ReturnType<typeof setTimeout> }>({})

  // Callbacks read through refs so the listeners below stay bound once.
  const getPayloadRef = useRef(getPayload)
  getPayloadRef.current = getPayload
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  const isOpen = useCallback(() => store.get(anchoredPopoverOpenAtom(id)), [store, id])

  const openWith = useCallback(
    (
      rect: IAnchorRect,
      text: string,
      payload: unknown,
      nextTarget: Element | null,
      live: (() => DOMRect | null) | null,
      reason: TAnchoredPopoverReason
    ) => {
      targetRef.current = nextTarget
      liveRectRef.current = live
      reasonRef.current = reason
      setTarget(nextTarget)
      showInStore({ rect, text, payload })
      onOpenChangeRef.current?.(true, reason)
    },
    [showInStore]
  )

  const close = useCallback(
    (reason: TAnchoredPopoverReason) => {
      if (!isOpen()) return
      hideInStore()
      targetRef.current = null
      reasonRef.current = null
      setTarget(null)
      onOpenChangeRef.current?.(false, reason)
    },
    [hideInStore, isOpen]
  )

  const clearTimers = useCallback(() => {
    clearTimeout(timers.current.open)
    clearTimeout(timers.current.close)
    timers.current = {}
  }, [])

  const resolvePayload = useCallback(
    (context: IAnchoredPopoverContext): unknown => getPayloadRef.current?.(context),
    []
  )

  /* ---------------------------------------------------------------- click */
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("click")) return

    const openFrom = (matched: Element, event: MouseEvent | KeyboardEvent, reason: "click" | "keyboard") => {
      const text = matched.textContent ?? ""
      const payload = resolvePayload({ target: matched, text, event })
      const link = matched.closest("a[href]")
      // A link keeps navigating unless it actually has popover content.
      if (link && (getPayloadRef.current === undefined || payload != null)) event.preventDefault()
      const rect =
        anchorTo === "pointer" && event instanceof MouseEvent
          ? toAnchorRect({ x: event.clientX, y: event.clientY })
          : toAnchorRect(matched)
      const live = anchorTo === "pointer" ? null : () => matched.getBoundingClientRect()
      openWith(rect, text, payload, matched, live, reason)
    }

    const onClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return
      const matched = closestMatch(event.target, match, view)
      if (!matched) return
      if (isOpen() && targetRef.current === matched) {
        close("toggle")
        return
      }
      openFrom(matched, event, "click")
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return
      const matched = closestMatch(event.target, match, view)
      // Native controls already turn Enter/Space into a click; let that path run.
      if (!matched || matched !== event.target || matched.matches(NATIVE_INTERACTIVE)) return
      event.preventDefault()
      if (isOpen() && targetRef.current === matched) {
        close("toggle")
        return
      }
      openFrom(matched, event, "keyboard")
    }

    view.addEventListener("click", onClick)
    view.addEventListener("keydown", onKeyDown)
    return () => {
      view.removeEventListener("click", onClick)
      view.removeEventListener("keydown", onKeyDown)
    }
  }, [ref, triggers, match, anchorTo, openWith, close, isOpen, resolvePayload])

  /* ---------------------------------------------------------------- hover */
  // TASK 4 fills this effect in.
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("hover")) return
    return undefined
  }, [ref, triggers, match, anchorTo, hoverDelay, hoverCloseDelay, openWith, close, isOpen, resolvePayload, clearTimers])

  /* ------------------------------------------------------------ selection */
  // TASK 5 fills this effect in.
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("selection")) return
    return undefined
  }, [ref, triggers, minSelectionLength, openWith, close, isOpen, resolvePayload])

  /* ----------------------------------------------------- lifecycle & api */
  useEffect(() => {
    return () => {
      clearTimers()
      // Unnamed instances die with the component; an explicit id persists.
      if (idProp === undefined) removeAnchoredPopoverInstance(id)
    }
  }, [clearTimers, id, idProp])

  const show = useCallback(
    (input: TAnchorInput, payload?: TPayload) => {
      const element = typeof Element !== "undefined" && input instanceof Element ? input : null
      const live =
        element ? () => element.getBoundingClientRect()
        : typeof Range !== "undefined" && input instanceof Range ? () => input.getBoundingClientRect()
        : null
      openWith(toAnchorRect(input), element?.textContent ?? "", payload, element, live, "show")
    },
    [openWith]
  )

  const hide = useCallback(() => close("hide"), [close])

  const handleOpenChange = useCallback(
    (next: boolean, details?: PopoverRoot.ChangeEventDetails) => {
      if (next) return
      if (details === undefined) {
        close("hide")
        return
      }
      // Base UI closes on pointerdown outside the popup. When that press lands
      // on a click/hover target the click handler owns the outcome (toggle or
      // switch), so the dismissal is cancelled here to avoid close-then-reopen.
      if (details.reason === "outside-press") {
        const view = ref.current
        const pressed = details.event?.target ?? null
        const handlesPress = triggers.includes("click") || triggers.includes("hover")
        if (view && handlesPress && closestMatch(pressed, match, view)) {
          details.cancel()
          return
        }
      }
      close("dismiss")
    },
    [close, match, ref, triggers]
  )

  const onPopupPointerEnter = useCallback(() => {
    clearTimeout(timers.current.close)
  }, [])

  const onPopupPointerLeave = useCallback(() => {
    if (reasonRef.current !== "hover") return
    clearTimeout(timers.current.close)
    timers.current.close = setTimeout(() => close("leave"), hoverCloseDelay)
  }, [close, hoverCloseDelay])

  const anchor = useMemo(
    () => (state.rect ? rectToVirtualAnchor(state.rect, ref.current, () => liveRectRef.current?.() ?? null) : null),
    // `ref.current` is read at memo time on purpose: it is set before layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.rect, ref]
  )

  const payload = state.payload as TPayload | undefined

  return {
    open: state.open,
    text: state.text,
    payload,
    target,
    anchor,
    show,
    hide,
    popoverProps: {
      id,
      open: state.open,
      anchor,
      text: state.text,
      payload,
      onOpenChange: handleOpenChange,
      onPopupPointerEnter,
      onPopupPointerLeave,
    },
  }
}
```

`selectionRangeWithin` is imported now so Task 5 does not touch the import block; eslint will flag it as unused until then — leave the import and add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` above the `import {` line only if `make check` fails on it in Step 6; remove that comment in Task 5.

- [ ] **Step 4: Create `anchored-popover.tsx`**

```tsx
"use client"

import type { MouseEvent as ReactMouseEvent, ReactElement } from "react"
import { Popover, PopoverPopup } from "@/components/ui/popover"
import { PopoverGlass } from "@/components/ui/popover-glass"
import { cn } from "@/lib/utils"
import type { IAnchoredPopoverProps, IAnchoredPopoverRenderProps } from "./type"

/**
 * Keep the reader's selection alive while they press a toolbar button inside
 * the popup: a mousedown would otherwise collapse it (and close a
 * selection-triggered popover) before the click lands. Form controls still
 * need the default so they can take focus.
 */
function preserveSelection(event: ReactMouseEvent<HTMLElement>): void {
  const target = event.target as Element
  if (target.closest("input, textarea, select, [contenteditable]")) return
  event.preventDefault()
}

/**
 * A popover with no trigger. `useAnchoredPopover` supplies `open`, the
 * virtual `anchor` and the dismiss handler through `popoverProps`; Base UI
 * does the positioning, portal, Escape and outside-press handling.
 */
export function AnchoredPopover<TPayload = unknown>({
  id,
  open,
  anchor,
  text,
  payload,
  onOpenChange,
  onPopupPointerEnter,
  onPopupPointerLeave,
  children,
  className,
  side = "top",
  variant,
  glassVariant,
  ...popupProps
}: IAnchoredPopoverProps<TPayload>): ReactElement {
  const renderProps: IAnchoredPopoverRenderProps<TPayload> = {
    open,
    text,
    payload,
    setOpen: (next) => onOpenChange(next),
    close: () => onOpenChange(false),
  }
  const content = typeof children === "function" ? children(renderProps) : children

  const shared = {
    ...popupProps,
    anchor: anchor ?? undefined,
    side,
    className: cn("max-w-64", className),
    onMouseDown: preserveSelection,
    onPointerEnter: onPopupPointerEnter,
    onPointerLeave: onPopupPointerLeave,
    "data-selection-popover": "",
    "data-anchored-popover": id,
  }

  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      {variant === "glass" ? (
        <PopoverGlass {...shared} glassVariant={glassVariant}>
          {content}
        </PopoverGlass>
      ) : (
        <PopoverPopup {...shared}>{content}</PopoverPopup>
      )}
    </Popover>
  )
}
```

- [ ] **Step 5: Add the new exports to `index.ts`**

Append to `react/src/components/atoms/text/selection/index.ts` (leave the existing lines in place for now):

```ts
export { AnchoredPopover } from "./anchored-popover"
export { useAnchoredPopover } from "./use-anchored-popover"
export { useAnchoredPopoverActions, useAnchoredPopoverState } from "./use-anchored-popover-state"
// The public atom surface — explicit on purpose, never `export *` from the atom module.
export {
  anchoredPopoverOpenAtom,
  anchoredPopoverPayloadAtom,
  anchoredPopoverRectAtom,
  anchoredPopoverStateAtom,
  anchoredPopoverTextAtom,
  hideAnchoredPopoverAtom,
  removeAnchoredPopoverInstance,
  showAnchoredPopoverAtom,
} from "./anchored-popover-atom"
```

- [ ] **Step 6: Run the tests and type-check**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx && make check`
Expected: 7 PASS; check clean.

Known fragilities and what to do, in order:
1. *"Clicking the open target closes" fails because it reopened*: Base UI's outside-press ran before our `click`. Confirm the reason string with `grep -n "outsidePress" node_modules/@base-ui/react/internals/reasons.d.ts`; if it is not `"outside-press"`, use the printed literal in `handleOpenChange`.
2. *Base UI logs a warning about a missing trigger*: it is informational; if it is an error, pass `modal={false}` on `Popover` (it is the default — only add it if the error names it).
3. *`user.keyboard("{Escape}")` does not close*: focus is on the span, not the popup. Base UI's Escape listener is document-level when open; if it still fails, add `await screen.findByText("Dismiss")` then `(await screen.findByText("Dismiss")).focus()` before pressing Escape — that is a test fix, not a component change.
4. *`anchor` typing rejects `IVirtualAnchor`*: Base UI's `anchor` accepts `VirtualElement` with `getBoundingClientRect(): ClientRectObject`; cast once in `anchored-popover.tsx`: `anchor: (anchor ?? undefined) as PopoverPopupProps["anchor"]` where `type PopoverPopupProps = ComponentProps<typeof PopoverPopup>`.

- [ ] **Step 7: Commit**

```bash
git add src/components/atoms/text/selection/use-anchored-popover.ts src/components/atoms/text/selection/anchored-popover.tsx src/components/atoms/text/selection/index.ts src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx
git commit -m "$(cat <<'EOF'
✨ feat(selection): useAnchoredPopover with click trigger and AnchoredPopover

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Hover trigger

**Files:**
- Modify: `react/src/components/atoms/text/selection/use-anchored-popover.ts` (the `/* hover */` effect)
- Test: `react/src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx` (append)

**Interfaces:**
- Consumes: `openWith`, `close`, `isOpen`, `resolvePayload`, `clearTimers`, `timers`, `targetRef`, `reasonRef` from Task 3.
- Produces: hover behavior on `trigger: "hover"`; `onPopupPointerEnter/Leave` already wired in Task 3.

- [ ] **Step 1: Append the failing hover tests**

```tsx
function HoverHarness({ onOpenChange }: { onOpenChange?: TOpenChange }) {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string>({
    ref,
    trigger: "hover",
    match: "[data-term]",
    getPayload: ({ target }) => (target as HTMLElement).dataset.term ?? "",
    hoverDelay: 10,
    hoverCloseDelay: 30,
    onOpenChange,
  })
  return (
    <div ref={ref}>
      <span data-term="alpha">alpha</span> <span>plain</span>
      <AnchoredPopover {...popover.popoverProps}>
        {({ payload }) => <p>hover:{payload}</p>}
      </AnchoredPopover>
    </div>
  )
}

describe("useAnchoredPopover · hover", () => {
  test("opens after the delay and closes after leaving", async () => {
    const user = userEvent.setup()
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<HoverHarness onOpenChange={onOpenChange} />)

    await user.hover(screen.getByText("alpha"))
    expect(screen.queryByText("hover:alpha")).toBeNull()
    expect(await screen.findByText("hover:alpha")).toBeTruthy()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "hover")

    await user.unhover(screen.getByText("alpha"))
    await waitFor(() => expect(screen.queryByText("hover:alpha")).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "leave")
  })

  test("moving into the popup keeps it open", async () => {
    const user = userEvent.setup()
    render(<HoverHarness />)
    await user.hover(screen.getByText("alpha"))
    const popup = await screen.findByText("hover:alpha")

    await user.unhover(screen.getByText("alpha"))
    await user.hover(popup)
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(screen.getByText("hover:alpha")).toBeTruthy()
  })

  test("leaving before the delay never opens; unmounting clears the timer", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<HoverHarness />)
    await user.hover(screen.getByText("alpha"))
    await user.unhover(screen.getByText("alpha"))
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(screen.queryByText("hover:alpha")).toBeNull()

    await user.hover(screen.getByText("alpha"))
    unmount()
    await new Promise((resolve) => setTimeout(resolve, 30))
    // No throw, no act() warning, nothing rendered.
    expect(document.querySelector("[data-anchored-popover]")).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx -t hover`
Expected: the first two FAIL (popover never appears).

- [ ] **Step 3: Fill in the hover effect**

Replace the `/* hover */` effect body in `use-anchored-popover.ts`:

```ts
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("hover")) return
    let pointer = { x: 0, y: 0 }

    const onPointerOver = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
      clearTimeout(timers.current.close)
      const matched = closestMatch(event.target, match, view)
      if (!matched) return
      if (isOpen() && targetRef.current === matched) return
      clearTimeout(timers.current.open)
      timers.current.open = setTimeout(() => {
        const text = matched.textContent ?? ""
        const payload = resolvePayload({ target: matched, text, event })
        const rect = anchorTo === "pointer" ? toAnchorRect(pointer) : toAnchorRect(matched)
        const live = anchorTo === "pointer" ? null : () => matched.getBoundingClientRect()
        openWith(rect, text, payload, matched, live, "hover")
      }, hoverDelay)
    }

    const onPointerOut = (event: PointerEvent) => {
      const related = event.relatedTarget
      const current = targetRef.current ?? closestMatch(event.target, match, view)
      // Moving between the target's own children is not a leave.
      if (related instanceof Node && current?.contains(related)) return
      clearTimeout(timers.current.open)
      if (reasonRef.current !== "hover") return
      clearTimeout(timers.current.close)
      timers.current.close = setTimeout(() => close("leave"), hoverCloseDelay)
    }

    // A press means a click trigger (or a selection) is about to win.
    const onPointerDown = () => clearTimeout(timers.current.open)

    view.addEventListener("pointerover", onPointerOver)
    view.addEventListener("pointerout", onPointerOut)
    view.addEventListener("pointerdown", onPointerDown)
    return () => {
      view.removeEventListener("pointerover", onPointerOver)
      view.removeEventListener("pointerout", onPointerOut)
      view.removeEventListener("pointerdown", onPointerDown)
      clearTimers()
    }
  }, [ref, triggers, match, anchorTo, hoverDelay, hoverCloseDelay, openWith, close, isOpen, resolvePayload, clearTimers])
```

- [ ] **Step 4: Run the tests**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx`
Expected: all PASS. If `user.hover` does not fire `pointerover` in happy-dom, switch the two listeners to `mouseover`/`mouseout` **and** keep the pointer ones (register both; the handlers are idempotent thanks to `clearTimeout` before each `setTimeout`).

- [ ] **Step 5: Commit**

```bash
git add src/components/atoms/text/selection/use-anchored-popover.ts src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx
git commit -m "$(cat <<'EOF'
✨ feat(selection): hover trigger for useAnchoredPopover

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Selection trigger

**Files:**
- Modify: `react/src/components/atoms/text/selection/use-anchored-popover.ts` (the `/* selection */` effect)
- Test: `react/src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx` (append)

**Interfaces:**
- Consumes: `selectionRangeWithin` (Task 1), `openWith`, `close`, `isOpen`, `resolvePayload`, `reasonRef` (Task 3).
- Produces: selection behavior on the default trigger.

- [ ] **Step 1: Append the failing selection tests**

```tsx
function selectText(element: Element, start: number, end: number) {
  const node = element.firstChild as Text
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  const selection = document.getSelection()!
  selection.removeAllRanges()
  selection.addRange(range)
  document.dispatchEvent(new Event("selectionchange"))
}

function collapseSelection() {
  document.getSelection()!.removeAllRanges()
  document.dispatchEvent(new Event("selectionchange"))
}

function SelectionHarness({ onOpenChange, minSelectionLength }: { onOpenChange?: TOpenChange; minSelectionLength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover({ ref, id: "selection-harness", onOpenChange, minSelectionLength })
  return (
    <>
      <div ref={ref}>
        <p>Selectable corpus text</p>
      </div>
      <p>Outside text</p>
      <AnchoredPopover {...popover.popoverProps}>{({ text }) => <p>sel:{text}</p>}</AnchoredPopover>
    </>
  )
}

describe("useAnchoredPopover · selection", () => {
  test("opens on pointerup after a selection inside the view, with the selected text", async () => {
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<SelectionHarness onOpenChange={onOpenChange} />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    expect(screen.queryByText("sel:Selectable")).toBeNull()

    document.dispatchEvent(new Event("pointerup"))
    expect(await screen.findByText("sel:Selectable")).toBeTruthy()
    expect(onOpenChange).toHaveBeenLastCalledWith(true, "selection")
  })

  test("a keyboard selection commits on keyup", async () => {
    render(<SelectionHarness />)
    selectText(screen.getByText("Selectable corpus text"), 11, 17)
    document.dispatchEvent(new Event("keyup"))
    expect(await screen.findByText("sel:corpus")).toBeTruthy()
  })

  test("collapsing the selection closes with reason collapse", async () => {
    const onOpenChange = mock<TOpenChange>(() => {})
    render(<SelectionHarness onOpenChange={onOpenChange} />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    document.dispatchEvent(new Event("pointerup"))
    await screen.findByText("sel:Selectable")

    collapseSelection()
    await waitFor(() => expect(screen.queryByText("sel:Selectable")).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, "collapse")
  })

  test("a selection outside the view is ignored and closes an open popover", async () => {
    render(<SelectionHarness />)
    selectText(screen.getByText("Selectable corpus text"), 0, 10)
    document.dispatchEvent(new Event("pointerup"))
    await screen.findByText("sel:Selectable")

    selectText(screen.getByText("Outside text"), 0, 7)
    document.dispatchEvent(new Event("pointerup"))
    await waitFor(() => expect(screen.queryByText(/^sel:/)).toBeNull())
  })

  test("selections shorter than minSelectionLength do not open", async () => {
    render(<SelectionHarness minSelectionLength={4} />)
    selectText(screen.getByText("Selectable corpus text"), 0, 3)
    document.dispatchEvent(new Event("pointerup"))
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(screen.queryByText(/^sel:/)).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx -t selection`
Expected: FAIL (nothing opens).

- [ ] **Step 3: Fill in the selection effect**

```ts
  useLayoutEffect(() => {
    const view = ref.current
    if (!view || !triggers.includes("selection")) return
    const doc = view.ownerDocument
    let pending = false

    const onSelectionChange = () => {
      const range = selectionRangeWithin(view)
      if (range) {
        pending = true
        return
      }
      pending = false
      if (reasonRef.current === "selection") close("collapse")
    }

    // Open only once the gesture ends, so a drag does not flicker the popup.
    const commit = (event: Event) => {
      if (!pending) return
      pending = false
      const range = selectionRangeWithin(view)
      if (!range) return
      const text = range.toString()
      if (text.trim().length < minSelectionLength) {
        if (reasonRef.current === "selection") close("collapse")
        return
      }
      const ancestor = range.commonAncestorContainer
      const target = ancestor.nodeType === Node.ELEMENT_NODE ? (ancestor as Element) : ancestor.parentElement
      const payload = resolvePayload({ target, text, event })
      openWith(toAnchorRect(range), text, payload, target, () => range.getBoundingClientRect(), "selection")
    }

    doc.addEventListener("selectionchange", onSelectionChange)
    doc.addEventListener("pointerup", commit)
    doc.addEventListener("keyup", commit)
    return () => {
      doc.removeEventListener("selectionchange", onSelectionChange)
      doc.removeEventListener("pointerup", commit)
      doc.removeEventListener("keyup", commit)
    }
  }, [ref, triggers, minSelectionLength, openWith, close, isOpen, resolvePayload])
```

Remove any `eslint-disable` comment added in Task 3 Step 3 for the unused `selectionRangeWithin` import.

- [ ] **Step 4: Run the tests and type-check**

Run: `bun test src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx && make check`
Expected: all PASS, check clean. If `selection.addRange` is a no-op in happy-dom (Task 1 Step 5 told you), replace `selectText` in the test with a `mock` of `document.getSelection` returning `{ rangeCount: 1, isCollapsed: false, getRangeAt: () => range }`, restore it in an `afterEach`, and note the happy-dom limitation in a one-line comment above the helper.

- [ ] **Step 5: Commit**

```bash
git add src/components/atoms/text/selection/use-anchored-popover.ts src/components/atoms/text/selection/__tests__/anchored-popover.test.tsx
git commit -m "$(cat <<'EOF'
✨ feat(selection): selection trigger for useAnchoredPopover

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `Text.Heading` / `Text.Paragraph` become plain text

**Files:**
- Modify: `react/src/components/atoms/text/heading.tsx`, `react/src/components/atoms/text/paragraph.tsx`, `react/src/components/atoms/text/type.ts`
- Test: `react/src/components/atoms/text/__tests__/text.test.tsx` (existing — must keep passing)

**Interfaces:**
- Produces: `THeadingProps = Omit<TTextProps, "type">`, `TParagraphProps = Omit<TTextProps, "type">`.

- [ ] **Step 1: Run the existing text tests to record the baseline**

Run: `bun test src/components/atoms/text/__tests__/text.test.tsx`
Expected: 3 PASS.

- [ ] **Step 2: Rewrite `heading.tsx`**

```tsx
import { cn } from "@/lib/utils"
import { Text } from "./default"
import type { THeadingProps } from "./type"
import { twClasses } from "./utils"

export function Heading({ className, ...props }: THeadingProps) {
  return <Text {...props} className={cn(twClasses["default"], className)} type="heading" />
}
```

- [ ] **Step 3: Rewrite `paragraph.tsx`**

```tsx
import { cn } from "@/lib/utils"
import { Text } from "./default"
import type { TParagraphProps } from "./type"
import { twClasses } from "./utils"

export function Paragraph({ className, ...props }: TParagraphProps) {
  return <Text {...props} className={cn(twClasses["default"], className)} type="paragraph" />
}
```

- [ ] **Step 4: Update `type.ts`**

In `react/src/components/atoms/text/type.ts`: delete the line `import type { ITextSelectionProps } from "../type"` and replace the two intersection types with:

```ts
export type THeadingProps = Omit<TTextProps, "type">

export type TParagraphProps = Omit<TTextProps, "type">
```

- [ ] **Step 5: Run the tests and type-check**

Run: `bun test src/components/atoms/text/__tests__/text.test.tsx && make check`
Expected: 3 PASS. `make check` will now fail in `registry/demos/text-demo.tsx` (it passes `renderPopover`/`selection` to `Text.Heading`) — that is expected and fixed in Task 8; everything else must be clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/atoms/text/heading.tsx src/components/atoms/text/paragraph.tsx src/components/atoms/text/type.ts
git commit -m "$(cat <<'EOF'
♻️ refactor(text): Heading and Paragraph drop the selection wrapper

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `Verse` migrates to the hook

**Files:**
- Rewrite: `react/src/components/composed/verse/verse.tsx`
- Modify: `react/src/components/composed/verse/type.ts`
- Test: `react/src/components/composed/verse/__tests__/verse.test.tsx` (existing + one new test)

**Interfaces:**
- Consumes: `useAnchoredPopover`, `AnchoredPopover` from `@/components/atoms/text/selection`; `ITextPopoverRenderProps`, `TAnchoredPopoverPopupProps` from `@/components/atoms/type`.
- Produces: unchanged public `Verse`, `VerseSpan`, `VerseNote` props.

- [ ] **Step 1: Add the failing test for a span without content**

Append inside `describe("verse", …)` in `verse.test.tsx`:

```tsx
  test("a span without popover content is a plain span", async () => {
    const user = userEvent.setup()
    render(
      <Verse chapter="1:2" href="#gen-1-2">
        and the <VerseSpan>earth</VerseSpan> was
      </Verse>
    )
    const span = screen.getByText("earth")
    expect(span.getAttribute("role")).toBeNull()
    expect(span.getAttribute("tabindex")).toBeNull()
    await user.click(span)
    expect(document.querySelector("[data-selection-popover]")).toBeNull()
  })

  test("spans open from the keyboard and expose their state", async () => {
    const user = userEvent.setup()
    render(<DemoVerse />)
    const span = screen.getByText("God created")
    expect(span.getAttribute("role")).toBe("button")
    expect(span.getAttribute("aria-haspopup")).toBe("dialog")
    expect(span.getAttribute("aria-expanded")).toBe("false")

    span.focus()
    await user.keyboard("{Enter}")
    expect(await screen.findByText("Span body")).toBeTruthy()
    expect(span.getAttribute("aria-expanded")).toBe("true")
  })
```

- [ ] **Step 2: Run it to verify the new tests fail**

Run: `bun test src/components/composed/verse/__tests__/verse.test.tsx`
Expected: the two new tests FAIL (`role` is not `"button"`); the pre-existing "renders the chapter as a link" test also fails today (`SPAN` vs `A`) — this task fixes it too.

- [ ] **Step 3: Update `verse/type.ts`**

```ts
import type { HTMLAttributes, ReactNode } from "react"
import type { TTextProps, TTextSize } from "@/components/atoms/text/type"
import type { ITextPopoverRenderProps, TAnchoredPopoverPopupProps } from "@/components/atoms/type"

/** Popover content a verse part can carry. One popup per verse renders whichever part was activated. */
export interface IVersePopoverProps {
  /** Popover content opened by clicking the part. */
  popover?: ReactNode
  /** Render function for applications that need full control of the markup. */
  renderPopover?: (props: ITextPopoverRenderProps) => ReactNode
  /** Positioner/popup props (side, align, className, …) applied while this part's popover is open. */
  popoverProps?: TAnchoredPopoverPopupProps
}

export interface IVerseProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children?: ReactNode
  className?: string
  /** Chapter reference rendered as a leading link, e.g. "3:16". */
  chapter?: ReactNode
  /** Destination of the chapter link. */
  href?: string
  /** Popover content opened by clicking the chapter link. */
  chapterPopover?: IVersePopoverProps["popover"]
  renderChapterPopover?: IVersePopoverProps["renderPopover"]
  /** Type scale shared with nested verse spans and notes. */
  size?: TTextSize
}

export type TVerseSpanProps = Omit<TTextProps, "type"> & IVersePopoverProps

export type TVerseNoteProps = Omit<TTextProps, "type"> & IVersePopoverProps
```

- [ ] **Step 4: Rewrite `verse.tsx`**

```tsx
"use client"

import { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef } from "react"
import type { ReactElement, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Text } from "@/components/atoms/text/default"
import { AnchoredPopover, useAnchoredPopover } from "@/components/atoms/text/selection"
import type { TTextSize } from "@/components/atoms/text/type"
import type { ITextPopoverRenderProps } from "@/components/atoms/type"
import type { IVersePopoverProps, IVerseProps, TVerseNoteProps, TVerseSpanProps } from "./type"

/** Every part with popover content registers here under a `useId()` key; the payload is that key. */
interface IVerseContextValue {
  size?: TTextSize
  openKey: string | null
  register: (key: string, entry: IVersePopoverProps) => () => void
}

const VerseContext = createContext<IVerseContextValue>({
  openKey: null,
  register: () => () => {},
})

const chapterClassName = "mr-1.5 align-super text-[0.7em] font-medium no-underline hover:underline"

function hasContent(entry: IVersePopoverProps): boolean {
  return entry.renderPopover !== undefined || (entry.popover !== undefined && entry.popover !== null)
}

/** Registers a part's popover content and returns the attributes that make it a target. */
function useVersePart(entry: IVersePopoverProps) {
  const { size, openKey, register } = useContext(VerseContext)
  const key = useId()
  const active = hasContent(entry)
  const { popover, renderPopover, popoverProps } = entry
  useLayoutEffect(() => {
    if (!active) return
    return register(key, { popover, renderPopover, popoverProps })
  }, [active, key, popover, popoverProps, register, renderPopover])
  const attributes = active
    ? {
        "data-verse-popover": key,
        "aria-haspopup": "dialog" as const,
        "aria-expanded": openKey === key,
      }
    : {}
  return { size, active, attributes }
}

export function Verse({
  chapter,
  chapterPopover,
  children,
  className,
  href,
  renderChapterPopover,
  size = "medium",
  ...props
}: IVerseProps): ReactElement {
  const ref = useRef<HTMLElement>(null)
  const registry = useRef(new Map<string, IVersePopoverProps>())
  const popover = useAnchoredPopover<string>({
    ref,
    trigger: "click",
    match: "[data-verse-popover]",
    getPayload: ({ target }) => target?.getAttribute("data-verse-popover") ?? "",
  })

  const register = useCallback((key: string, entry: IVersePopoverProps) => {
    registry.current.set(key, entry)
    return () => {
      registry.current.delete(key)
    }
  }, [])

  const openKey = popover.open ? (popover.payload ?? null) : null
  const context = useMemo<IVerseContextValue>(() => ({ size, openKey, register }), [size, openKey, register])

  const chapterEntry: IVersePopoverProps = { popover: chapterPopover, renderPopover: renderChapterPopover }
  const chapterKey = useId()
  const chapterActive = hasContent(chapterEntry)
  useLayoutEffect(() => {
    if (!chapterActive) return
    return register(chapterKey, chapterEntry)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterActive, chapterKey, chapterPopover, register, renderChapterPopover])

  const activeEntry = openKey ? registry.current.get(openKey) : undefined

  return (
    <VerseContext.Provider value={context}>
      <Text {...props} className={className} data-verse="" ref={ref} size={size} type="paragraph">
        {chapter !== undefined && chapter !== null ? (
          <Text
            className={chapterClassName}
            href={href}
            size={size}
            type="link"
            {...(chapterActive
              ? { "data-verse-popover": chapterKey, "aria-haspopup": "dialog", "aria-expanded": openKey === chapterKey }
              : {})}
          >
            {chapter}
          </Text>
        ) : null}
        {children}
      </Text>
      <AnchoredPopover {...popover.popoverProps} {...activeEntry?.popoverProps}>
        {(renderProps) => renderVerseEntry(activeEntry, renderProps)}
      </AnchoredPopover>
    </VerseContext.Provider>
  )
}

function renderVerseEntry(entry: IVersePopoverProps | undefined, renderProps: ITextPopoverRenderProps): ReactNode {
  if (!entry) return null
  if (entry.renderPopover) return entry.renderPopover(renderProps)
  return entry.popover
}

export function VerseSpan({ className, size, popover, renderPopover, popoverProps, ...props }: TVerseSpanProps): ReactElement {
  const part = useVersePart({ popover, renderPopover, popoverProps })
  return (
    <Text
      {...props}
      {...part.attributes}
      className={cn(
        "underline decoration-muted-foreground/50 decoration-dotted underline-offset-4",
        part.active && "cursor-pointer",
        className
      )}
      role={part.active ? "button" : undefined}
      size={size ?? part.size}
      tabIndex={part.active ? 0 : undefined}
    />
  )
}

export function VerseNote({ className, size, popover, renderPopover, popoverProps, ...props }: TVerseNoteProps): ReactElement {
  const part = useVersePart({ popover, renderPopover, popoverProps })
  return (
    <Text
      {...props}
      {...part.attributes}
      className={cn("mx-0.5 text-[0.75em]", part.active && "cursor-pointer", className)}
      role={part.active ? "button" : undefined}
      size={size ?? part.size}
      tabIndex={part.active ? 0 : undefined}
      type="subscript"
    />
  )
}
```

`Text` must accept a `ref`. Check `react/src/components/atoms/text/default.tsx`: it is a plain function component calling `createElement(tag, { ...props })` — in React 19 `ref` is an ordinary prop, so `ref={ref}` flows through `...props` into `createElement` and lands on the element. If `TTextProps` rejects `ref`, add `ref?: Ref<HTMLElement>` to `TTextProps` in `atoms/text/type.ts` (import `Ref` from react) and pass it explicitly in `default.tsx` (`ref,` in the props object passed to `createElement`).

- [ ] **Step 5: Run the verse tests and type-check**

Run: `bun test src/components/composed/verse/__tests__/verse.test.tsx && make check`
Expected: 5 PASS (the three existing ones — including the previously failing chapter-is-a-link test — plus the two new). `make check` still fails only in `registry/demos/text-demo.tsx` (fixed in Task 8).

If "chapter, span and note each open their own popover on click" fails on the chapter: happy-dom follows `href="#gen-1"` only if the click is not prevented — confirm `getPayload` returned the chapter key (non-empty string) so `openFrom` prevented the default.

- [ ] **Step 6: Commit**

```bash
git add src/components/composed/verse/verse.tsx src/components/composed/verse/type.ts src/components/composed/verse/__tests__/verse.test.tsx
git commit -m "$(cat <<'EOF'
♻️ refactor(verse): one anchored popover per verse, no trigger wrappers

Spans, notes and the chapter link register their content and become
keyboard-activatable targets; the public props do not change.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Demo and docs

**Files:**
- Rewrite: `react/src/registry/demos/text-demo.tsx`
- Modify: `react/content/atoms/text.mdx`, `react/content/composed/verse.mdx`

**Interfaces:**
- Consumes: `useAnchoredPopover`, `AnchoredPopover` via `@/components/atoms/text/selection`; `Text` via `@/components/atoms/text`.

- [ ] **Step 1: Rewrite `text-demo.tsx`**

```tsx
"use client"

import * as React from "react"

import { DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Text } from "@/components/atoms/text"
import { AnchoredPopover, useAnchoredPopover } from "@/components/atoms/text/selection"

const TYPES = ["default", "heading", "paragraph", "link", "subscript"] as const
const SIZES = ["small", "medium", "large"] as const

type TDemoType = (typeof TYPES)[number]
type TDemoSize = (typeof SIZES)[number]

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

export default function TextDemo(): React.ReactElement {
  const [type, setType] = React.useState<TDemoType>("default")
  const [size, setSize] = React.useState<TDemoSize>("medium")
  const [selection, setSelection] = React.useState(false)

  // One view, two triggers: select any text, or click a marked term.
  const ref = React.useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string | null>({
    ref,
    trigger: ["selection", "click"],
    match: "[data-term]",
    getPayload: ({ target }) => (target as HTMLElement | null)?.dataset.term ?? null,
    minSelectionLength: 2,
  })

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect label="type" options={TYPES} value={type} onChange={setType} />
          <DemoSelect label="size" options={SIZES} value={size} onChange={setSize} />
          <DemoToggle checked={selection} label="selection" onChange={setSelection} />
        </>
      }
    >
      <div className="grid max-w-xl gap-5">
        <Text.Root selection={selection} size={size} type={type}>
          A reusable text primitive for corpus prose and interface copy.
        </Text.Root>
        <div className="grid gap-3 border-t pt-4 text-muted-foreground" ref={ref}>
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Select words in either block, or click a dotted term
          </p>
          <Text.Heading size="large">Select this heading to inspect the current selection.</Text.Heading>
          <Text.Paragraph size="medium">
            This paragraph sits in the same view, so selecting any part of it opens the popover
            above the selection, and clicking{" "}
            <span className="cursor-pointer underline decoration-dotted underline-offset-4" data-term="lemma" role="button" tabIndex={0}>
              lemma
            </span>{" "}
            or{" "}
            <span className="cursor-pointer underline decoration-dotted underline-offset-4" data-term="apparatus" role="button" tabIndex={0}>
              apparatus
            </span>{" "}
            opens it on the word instead.
          </Text.Paragraph>
        </div>
        <AnchoredPopover {...popover.popoverProps} variant="glass">
          {({ text, payload, close }) => (
            <div className="grid gap-1">
              <Caption>{payload ? "Clicked term" : "Selected text"}</Caption>
              <p className="text-sm text-foreground">{payload ?? text}</p>
              <button className="justify-self-start text-xs text-primary hover:text-primary/80" onClick={close} type="button">
                Dismiss
              </button>
            </div>
          )}
        </AnchoredPopover>
      </div>
    </DemoStage>
  )
}
```

- [ ] **Step 2: Update `content/atoms/text.mdx`**

Replace the `## Usage` block and append a section:

````mdx
## Usage

```tsx
import { Text, AnchoredPopover, useAnchoredPopover } from "@exegia/corpora-ui"

<Text.Heading size="large">Corpus title</Text.Heading>
<Text.Paragraph>Readable corpus prose belongs here.</Text.Paragraph>
<Text.Root type="link" href="/activity">View activity</Text.Root>
```

## Popovers on selection, click or hover

No wrapper around the text: hold a `ref` to any view, call the hook, and
render one `AnchoredPopover` anywhere. Base UI positions it against the
selection, the clicked element or the pointer.

```tsx
function Reader() {
  const ref = useRef<HTMLDivElement>(null)
  const popover = useAnchoredPopover<string>({
    ref,
    trigger: ["selection", "click"],
    match: "[data-term]",
    getPayload: ({ target, text }) => target?.getAttribute("data-term") ?? text,
  })
  return (
    <div ref={ref}>
      <Text.Paragraph>
        Select any words, or click <span data-term="lemma">lemma</span>.
      </Text.Paragraph>
      <AnchoredPopover {...popover.popoverProps} side="top">
        {({ payload, close }) => <Toolbar term={payload} onDone={close} />}
      </AnchoredPopover>
    </div>
  )
}
```

| Option               | Type                                                      | Default         | Description                                                                 |
| -------------------- | --------------------------------------------------------- | --------------- | --------------------------------------------------------------------------- |
| `ref`                | `RefObject<HTMLElement>`                                  | —               | The view. Listeners attach here; selections outside it are ignored.         |
| `id`                 | `string`                                                  | `useId()`       | Instance id. An explicit id survives remounts and can be driven remotely.   |
| `trigger`            | `"selection" \| "click" \| "hover"` or an array           | `"selection"`   | Which events open the popover.                                              |
| `match`              | `string \| (el) => boolean`                               | any element     | click/hover: which descendants are targets.                                 |
| `getPayload`         | `({ target, text, event }) => TPayload`                   | —               | Data handed to the popup render function.                                   |
| `anchorTo`           | `"target" \| "pointer"`                                   | `"target"`      | click/hover: anchor on the element or on the event point.                   |
| `minSelectionLength` | `number`                                                  | `1`             | Shorter selections do not open.                                             |
| `hoverDelay` / `hoverCloseDelay` | `number`                                      | `300` / `150`   | Hover timings in ms.                                                        |
| `onOpenChange`       | `(open, reason) => void`                                  | —               | Reasons: `selection`, `click`, `keyboard`, `hover`, `collapse`, `toggle`, `leave`, `dismiss`, `show`, `hide`. |

The hook returns `{ open, text, payload, target, anchor, show, hide, popoverProps }`.
`show(elementOrRectOrPoint, payload?)` opens from any custom event. From
elsewhere in the app, `useAnchoredPopoverState(id)` reads the selection and
`useAnchoredPopoverActions(id).hide()` closes it.

`AnchoredPopover` takes `popoverProps` plus the positioner props (`side`,
`align`, `sideOffset`, `className`) and `variant="glass"` with an optional
`glassVariant`. Its children may be a node or a render function receiving
`{ open, text, payload, close, setOpen }`.

### Removed

`TextClickPopover`, `TextSelection`, `HighlightPopover`, `useSelection` and the
selection props on `Text.Heading` / `Text.Paragraph` are gone. Wrap-free
replacement: the hook above; `Verse` keeps its `popover` props and uses it
internally.
````

- [ ] **Step 3: Update `content/composed/verse.mdx`**

After the `## Props` table, add:

```mdx
Spans, notes and the chapter link that carry popover content are keyboard
targets (`role="button"`, Enter/Space open) and expose `aria-expanded`. One
popover per verse renders whichever part was activated.
```

- [ ] **Step 4: Type-check and build the docs**

Run: `make check && bun run build:docs`
Expected: both clean. (`make check` is fully green again now that the demo no longer passes selection props to `Text.Heading`.)

- [ ] **Step 5: Commit**

```bash
git add src/registry/demos/text-demo.tsx content/atoms/text.mdx content/composed/verse.mdx
git commit -m "$(cat <<'EOF'
📝 docs(text): document useAnchoredPopover and rework the text demo

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Remove the old components, the dependency, and update the barrels

**Files:**
- Delete: `react/src/components/atoms/text/selection/{click-popover.tsx,popover.tsx,selection.tsx,selection-atom.ts,use-selection.ts}` and `__tests__/{click-popover.test.tsx,text-selection.test.tsx}`
- Rewrite: `react/src/components/atoms/text/selection/index.ts`
- Modify: `react/src/components/atoms/text/selection/type.ts` (drop legacy types), `react/src/components/atoms/index.ts`, `react/src/components/type.ts`, `react/package.json`

**Interfaces:**
- Produces: the final public surface of `atoms/text/selection`.

- [ ] **Step 1: Delete the old files**

```bash
cd /home/emmanuel/Projects/corpora-apps/corpora-ui/react
git rm src/components/atoms/text/selection/click-popover.tsx src/components/atoms/text/selection/popover.tsx src/components/atoms/text/selection/selection.tsx src/components/atoms/text/selection/selection-atom.ts src/components/atoms/text/selection/use-selection.ts src/components/atoms/text/selection/__tests__/click-popover.test.tsx src/components/atoms/text/selection/__tests__/text-selection.test.tsx
```

- [ ] **Step 2: Rewrite `index.ts`**

```ts
export { AnchoredPopover } from "./anchored-popover"
export { useAnchoredPopover } from "./use-anchored-popover"
export { useAnchoredPopoverActions, useAnchoredPopoverState } from "./use-anchored-popover-state"
// The public atom surface — explicit on purpose, never `export *` from the atom module.
export {
  anchoredPopoverOpenAtom,
  anchoredPopoverPayloadAtom,
  anchoredPopoverRectAtom,
  anchoredPopoverStateAtom,
  anchoredPopoverTextAtom,
  hideAnchoredPopoverAtom,
  removeAnchoredPopoverInstance,
  showAnchoredPopoverAtom,
} from "./anchored-popover-atom"
```

- [ ] **Step 3: Trim `type.ts` to the new types**

Delete from `type.ts`: `ISelectionPosition`, `ISelectionState`, `TSelectionStateUpdate`, `ISelectionRenderProps`, `TSelectionPopoverComponent`, `THighlightPopoverPrimitiveProps`, `IHighlightPopoverProps`, `ITextSelectionProps`, `ITextClickPopoverProps`, `IUseSelectionOptions`, `IUseSelectionResult`, and the imports `ComponentType`, `ElementType`, `HTMLAttributes`, `HighlightPopoverPrimitive`, `TTextProps`. Keep `ITextPopoverRenderProps` and everything added in Task 1. The import block becomes:

```ts
import type { ComponentProps, ReactNode, RefObject } from "react"
import type { PopoverRoot } from "@base-ui/react/popover"
import type { PopoverPopup } from "@/components/ui/popover"
import type { TPopoverGlassProps } from "@/components/ui/popover-glass"
```

- [ ] **Step 4: Update `atoms/index.ts`**

Replace

```ts
export {
  HighlightPopover,
  TextClickPopover,
  TextSelection,
} from "./text-selection"
```

with

```ts
export * from "./text/selection"
```

- [ ] **Step 5: Update `components/type.ts`**

Replace the six lines

```ts
  | NAtomsProps.ISelectionRenderProps
  | NAtomsProps.THighlightPopoverPrimitiveProps
  | NAtomsProps.IHighlightPopoverProps
  | NAtomsProps.ITextSelectionProps
  | NAtomsProps.ITextPopoverRenderProps
  | NAtomsProps.ITextClickPopoverProps
```

with

```ts
  | NAtomsProps.ITextPopoverRenderProps
  | NAtomsProps.IAnchoredPopoverProps
  | NAtomsProps.IUseAnchoredPopoverOptions
```

- [ ] **Step 6: Remove the dependency**

Run: `cd /home/emmanuel/Projects/corpora-apps/corpora-ui/react && bun remove @omsimos/react-highlight-popover`
Then: `grep -rn "react-highlight-popover" src content package.json` — expected: no matches.

- [ ] **Step 7: Full verification**

Run: `make check && bun test && bun run build:docs`
Expected: check clean; `bun test` reports 0 fail (the two old `SPAN`-vs-`A` failures are gone with their components); docs build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A src/components/atoms/text/selection src/components/atoms/index.ts src/components/type.ts package.json bun.lock
git commit -m "$(cat <<'EOF'
💥 refactor(selection)!: remove TextSelection, HighlightPopover and TextClickPopover

Replaced by useAnchoredPopover + AnchoredPopover. Drops
@omsimos/react-highlight-popover. Text.Heading/Text.Paragraph no longer
take selection props; Verse keeps its API.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Spec acceptance pass

**Files:** none new.

- [ ] **Step 1: Walk the spec's §8 list against the test file**

Open `docs/superpowers/specs/2026-10-03-anchored-popover-hook-design.md` §8 and tick each bullet against `__tests__/anchored-popover.test.tsx`, `__tests__/anchored-popover-atom.test.tsx`, `verse.test.tsx`, `text.test.tsx`. Every bullet must map to a named test; if one is missing, add it to the owning file in the style of that file.

- [ ] **Step 2: Manual check in the docs site (3 minutes)**

Run: `bun run dev` and open the Text page. Verify: drag-select a sentence → popover appears above it and follows scroll; click "lemma" → popover on the word; click it again → closes; Escape closes; a selection that ends outside the block does not open. Open the Verse page: Tab to a dotted span, press Enter → popover; Shift-click the chapter link → navigates.

- [ ] **Step 3: Record anything found**

Fix in place with a `🐛 fix(selection): …` commit, or note it under a new `## Follow-ups` heading at the bottom of the spec and commit the spec.
