# composed/tree

Nested item tree in four shapes — `navigation`, `toc`, `sidebar` (icon rail),
`files` (explorer). It is the **reference implementation** of the Jotai
state pattern described in `react/CLAUDE.md` ("State" section) — read that
first; this file only holds what is specific to the tree.

## File map

| File                | Owns                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `type.ts`           | `TreeNode`, `TreeProps` (data form × controller form), `TreeState`/`TreeActions`, `@internal` config/handlers/seed. No imports besides React types. |
| `tree-atom.ts`      | Every atom, keyed by `treeId` (`keyed()` families) and per node (`nodeFamily`). All mutations are write-only action atoms. `debugLabel` = `tree/<id>/<name>`. |
| `use-tree.ts`       | `useTree(options)` — mounts an instance, projects controlled props into the store, returns the `TreeController`. |
| `use-tree-state.ts` | `useTreeState(id)` (reads, re-renders on any change) and `useTreeActions(id)` (writes only, never re-renders). |
| `use-tree-dnd.ts`   | Stable drag handlers for `files`; they read `draggedId`/`dropTarget` out of the store at call time.       |
| `tree-context.ts`   | Context value = `{ treeId, renderTrailing, dnd }` only. Never the controller.                            |
| `tree.tsx`          | `Tree` (props form → `UncontrolledTree`, controller form → `TreeView`), roving keyboard nav. |
| `tree-node.tsx`     | `TreeRow` (memoized). Per-node atom subscriptions, row kind resolution, rename input, tooltip, toc overlay toggle, trailing slot, branch animation. |
| `constants.ts`      | Durations, easings, motion variants.                                                                    |
| `utils.ts`          | Pure tree helpers (`findNode`, `moveNode`, `renameNode`, ancestor walks).                               |
| `index.ts`          | Barrel. Public atoms are listed explicitly — never `export *`.                                          |
| `__tests__/`        | `tree.test.tsx` (rendering per variant), `use-tree.test.tsx` (controller/hook), `tree-atom.test.tsx` (store + memo guard). |

## Row anatomy (as of 2026-08-18)

- **Every non-section row is the shared `ui/button` `Button`** (`variant="ghost"`,
  or `"secondary"` for the active sidebar row). Section headings in a 3-level
  `navigation` tree stay a plain `<button>`. **Nothing renders an `<a>` any
  more.**
- `TreeNode.href` / `target` are **metadata** — they ride along on the node
  handed to `onNavigate`. Routing has exactly one path:
  `selectTreeNodeAtom` → `node.onSelect?.()` → `handlers.onNavigate?.(node)`.
  One native behaviour survives the anchor removal: `toc` rows below the
  route level (depth > 0, or any toc row with a `#hash` href) set
  `window.location.hash` **after** `select` in `handlePress` — same order the
  old `<a>` default gave, same `:target`/history semantics. A non-hash href
  on a toc row disables the jump (it is a route). Controller `select()` from
  outside does NOT jump — the hash write lives in the row, not the atom,
  because it is a DOM concern.
- Row-level `data-*` (`data-slot="tree-row"`, `data-id`, `data-branch`,
  `data-expanded`, `data-active`, `data-cuelume-press`) come from
  `rowInteractionProps`, spread onto the Button; Base UI's `mergeProps` lets
  them override Button's own `data-slot="button"`. `sound` is forwarded to the
  Button so its press/release cues follow the tree's `sound` prop.
- Collapsed sidebar rows are `h-10! rounded-xl! justify-center px-0` tiles
  spanning the **full rail width** — the rail itself stays `w-full` in both
  states; its fold is the container's width change (an icon-collapsed panel)
  plus the labels folding. Folded icons step up to `size-5 text-foreground`.
- Row kinds (`rowKindOf`): `link` (selectable, `aria-expanded` absent),
  `toggle` (parent in navigation/files, `aria-expanded` on the row),
  `section` (top level of a 3-level navigation tree). `toc` parents are
  `link` rows with a separate overlay `<button aria-label="Expand X">`.
- The trailing slot (`renderTrailing`, files only) is a **sibling** of the row
  inside `.group/row-actions`, never a child — a button inside a button is
  invalid HTML and React warns.

## Lessons learned (chronological)

1. **Rows read per-node atoms, not the controller.** Reading the whole
   controller off context re-rendered every row on every toggle.
   `tree-atom.test.tsx` counts `renderTrailing` calls per node to guard the
   memo + per-node subscriptions. (0021dee)
2. **Controlled props are projected, not mirrored.** `useTree` writes
   controlled `items`/`activeId`/`collapsed` into the store in a layout effect
   with write gates. `treeOwnedItemsAtom` reads empty while a prop owns the
   data — without it an inline `items={[…]}` array loops forever.
3. **Keep the rail label mounted.** Unmounting the label on collapse killed
   the fold animation; it animates `width/opacity/x/display` in place and the
   test asserts `display: none`, not absence. (12b6a1f)
4. **Both rail width endpoints must be px** *(historical — the rail no
   longer animates its own width; the container's fold carries it, see the
   fix/tree-collapsed-behavior entry)*. Motion cannot tween a number
   against `"100%"`; doing so pinned the inline width at the collapsed value
   and the rail never reopened. (a69072d, 2f7539f)
5. **Tooltip is disabled, not unmounted, when the rail expands.** Swapping the
   wrapper remounts the row and cuts the label fold short. Test asserts row
   identity across collapse.
6. **Trailing actions live beside the row.** See "Row anatomy". (2c59e53)
7. **Rows became `Button`; anchors were removed** (2026-08-18, this branch).
   Consequences that had to follow: tests query `role: "button"` everywhere,
   `href` documentation flipped from "renders an anchor" to "metadata for
   `onNavigate`", `RAIL_COLLAPSED_WIDTH` 44 → 40 to match `w-10`, `sound`
   forwarded to Button, and the toc `#{id}` anchor test was rewritten as
   "row selects, overlay toggle expands". The native `#{id}` jump for toc
   rows was then restored via `location.hash` in `handlePress` (see "Row
   anatomy") — dropping it silently was a regression, not a simplification.
8. **`settleExit()` must run inside `act`.** AnimatePresence exits finishing
   during a bare `setTimeout` wait produce "not wrapped in act" warnings;
   `act(() => new Promise(r => setTimeout(r, 400)))` keeps them tracked. Query
   **once** after settling — happy-dom serves stale `waitFor` results while an
   exit is in flight (see memory `corpora-ui-happy-dom-exit-animations`).

## Testing notes

- Run from `react/`: `bun test src/components/composed/tree`.
- happy-dom cannot drive Base UI hover/focus-visible, so tooltip tests assert
  the wiring (`data-base-ui-tooltip-trigger`) not the popup.
- happy-dom rects are zero-height, so DnD tests hit the 0.5-midpoint fallback
  ("inside" for folders, "after" for leaves).
- Motion sets no inline styles under happy-dom — the rail width tests lock
  the **class**; the px tween is only verifiable in a real browser.
- Browser check via the docs demo (`/components/tree`, dev server config
  `corpora-ui-docs`): the demo's Base UI `Select` only takes clicks on the
  option's real viewport rect (screenshot frame is scaled — convert), and if
  the Browser pane tab is hidden (`document.hidden`) both WAAPI and motion's
  frameloop pause, so animated end-states can't be observed there — front the
  tab or use a real browser for the fold.

## Change log

- **2026-08-22 — fix/tree-collapsed-behavior** (on `release/v0.28.0`)
  - `tree.tsx`: the rail no longer narrows itself — the `w-10` collapsed
    class, the width measurement (`railRef`/ResizeObserver) and the px width
    tween are gone. The list is `w-full` in both states (root `motion.ul` →
    plain `ul`); the nav wrapper dropped `justify-center` for `w-full`. The
    fold is the hosting panel's width change plus the labels folding.
  - `tree-node.tsx`: folded rail icons step up to `size-5` and take
    `text-foreground` (rows are icon-only, so muted-at-rest read as disabled).
  - `constants.ts`: `RAIL_COLLAPSED_WIDTH` removed (was internal-only).
  - `blocks/profile/profile-card-block.tsx`: the folded card is a full-width
    `h-10 w-full` row (was a `-mx-1 size-10` tile) so the avatar centres on
    the rail's own centre line regardless of panel width.

- **2026-08-18 — fix/tree-collapsed** (on `release/v0.21.0`)
  - `tree-node.tsx`: link/toggle rows render the shared `Button` (ghost /
    secondary when active on sidebar); anchor branch removed; collapsed rail
    rows `h-10! rounded-xl!`; rename input borderless; `cursor-pointer` on
    rows/toggles; `sound` forwarded to Button.
  - `tree.tsx`: rail resting class `w-11` → `w-10`, `gap-y-2!` when collapsed.
  - `constants.ts`: `RAIL_COLLAPSED_WIDTH` 44 → 40.
  - `type.ts` / `registry/components.ts`: `href`, `onNavigate`, `navigation`
    and `toc` docs describe button rows + `onNavigate`-only navigation.
  - `__tests__/tree.test.tsx`: link → button queries; new tests for `href`
    passthrough, `sound={false}`, `RAIL_COLLAPSED_WIDTH` ↔ `w-10`, collapsed
    tile classes, active-row `secondary` variant, toc row-vs-toggle split,
    toc `#{id}` / `#hash` jump after `onNavigate` (route rows leave the hash
    alone).
  - `__tests__/*.test.tsx`: `settleExit` wrapped in `act`.
- **2026-08-17** — Jotai migration (`ExegiaProvider`, atom families,
  `useTree`/`useTreeState`/`useTreeActions`), rail reopen + measurement fixes,
  label kept mounted, trailing actions moved out of the row, headless
  controller API.
- **2026-08-16** — Initial four-variant tree, tooltip on collapsed rail rows,
  motion + a11y pass.
