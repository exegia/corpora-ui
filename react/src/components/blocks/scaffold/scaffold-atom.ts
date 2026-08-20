/**
 * Scaffold state — Jotai atom families keyed by a scaffold id.
 *
 * Same layout as the tree (`components/composed/tree/tree-atom.ts`), the
 * shell (`blocks/shell/shell-fit-atom.ts`) and the profile card: in-house
 * `keyed()` families per field, write-only action atoms, a composed
 * read-only state atom, and `removeScaffoldInstance` to drop an id from
 * every family.
 *
 * The visibility bookkeeping (`visibleOrder` / `autoHidden` / `userHidden`)
 * stays one atom on purpose — `reconcileVisibility` always settles the three
 * lists together, so splitting them would only invite half-written states.
 * The reconcile rule itself lives in `utils.ts`, and every action that moves
 * an input (ids, capacity, a toggle) settles the visibility before it
 * returns, so readers never see an interim state — the render-time settling
 * the old `usePanelVisibility` hook needed has no equivalent here.
 */

import { atom } from "jotai"
import type { Atom, Getter, Setter } from "jotai"

import { SCAFFOLD_PANEL_CAPACITY } from "./constants"
import type {
  ScaffoldConfig,
  ScaffoldHandlers,
  ScaffoldInstanceId,
  ScaffoldPanelVisibility,
  ScaffoldState,
} from "./type"
import {
  EMPTY_SCAFFOLD_VISIBILITY,
  getPanelCapacity,
  reconcileVisibility,
} from "./utils"

const DEFAULT_CONFIG: ScaffoldConfig = { controlsInspector: false }
const NO_HANDLERS: ScaffoldHandlers = {}
const NO_PANEL_IDS: readonly string[] = []

// ── families ───────────────────────────────────────────────────────────────

type Family<AtomType> = ((id: ScaffoldInstanceId) => AtomType) & {
  remove: (id: ScaffoldInstanceId) => void
}

const families: { remove: (id: ScaffoldInstanceId) => void }[] = []

function keyed<AtomType>(create: (id: ScaffoldInstanceId) => AtomType) {
  const cache = new Map<ScaffoldInstanceId, AtomType>()
  const family = ((id: ScaffoldInstanceId) => {
    let instance = cache.get(id)
    if (instance === undefined) {
      instance = create(id)
      cache.set(id, instance)
    }
    return instance
  }) as Family<AtomType>
  family.remove = (id: ScaffoldInstanceId) => {
    cache.delete(id)
  }
  families.push(family)
  return family
}

function stateFamily<Value>(name: string, initialValue: Value) {
  return keyed((id) => {
    const instance = atom(initialValue)
    instance.debugLabel = `scaffold/${id}/${name}`
    return instance
  })
}

function readFamily<Value>(
  name: string,
  read: (get: Getter, id: ScaffoldInstanceId) => Value
) {
  return keyed((id) => {
    const instance = atom((get) => read(get, id))
    instance.debugLabel = `scaffold/${id}/${name}`
    return instance
  })
}

function actionFamily<Args extends unknown[]>(
  name: string,
  write: (
    get: Getter,
    set: Setter,
    id: ScaffoldInstanceId,
    ...args: Args
  ) => void
) {
  return keyed((id) => {
    const instance = atom(null, (get, set, ...args: Args) =>
      write(get, set, id, ...args)
    )
    instance.debugLabel = `scaffold/${id}/${name}`
    return instance
  })
}

/** A family keyed by scaffold AND panel, so a tab or a panel subscribes to
 * its own boolean and sits still when a sibling's changes — the per-node
 * rule from the tree, at panel scale. Removal drops a whole scaffold. */
function panelFamily<Value>(
  name: string,
  read: (get: Getter, id: ScaffoldInstanceId, panelId: string) => Value
) {
  const cache = new Map<ScaffoldInstanceId, Map<string, Atom<Value>>>()
  const family = (id: ScaffoldInstanceId, panelId: string): Atom<Value> => {
    let panels = cache.get(id)
    if (panels === undefined) {
      panels = new Map()
      cache.set(id, panels)
    }
    let instance = panels.get(panelId)
    if (instance === undefined) {
      const created = atom((get) => read(get, id, panelId))
      created.debugLabel = `scaffold/${id}/${panelId}/${name}`
      panels.set(panelId, created)
      instance = created
    }
    return instance
  }
  families.push({
    remove: (id: ScaffoldInstanceId) => {
      cache.delete(id)
    },
  })
  return family
}

// ── primitives ─────────────────────────────────────────────────────────────

export const scaffoldInspectorOpenAtom = stateFamily<boolean>(
  "inspectorOpen",
  false
)

/** @internal The canvas's ordered panel ids, as registered each render. */
export const scaffoldPanelIdsAtom = stateFamily<readonly string[]>(
  "panelIds",
  NO_PANEL_IDS
)

/** @internal The capacity derived from the canvas's measured width — the
 * derived number is stored, not the raw width, so resize storms only touch
 * the store when a panel actually gains or loses room. */
export const scaffoldMeasuredCapacityAtom = stateFamily<number | null>(
  "measuredCapacity",
  null
)

/** @internal The three visibility lists, settled as one value. */
export const scaffoldVisibilityAtom = stateFamily<ScaffoldPanelVisibility>(
  "visibility",
  EMPTY_SCAFFOLD_VISIBILITY
)

export const scaffoldHoveredPanelIdAtom = stateFamily<string | null>(
  "hoveredPanelId",
  null
)

/** @internal */
export const scaffoldConfigAtom = stateFamily<ScaffoldConfig>(
  "config",
  DEFAULT_CONFIG
)

/** @internal */
export const scaffoldHandlersAtom = stateFamily<ScaffoldHandlers>(
  "handlers",
  NO_HANDLERS
)

// ── derived ────────────────────────────────────────────────────────────────

/** How many panels fit side by side; the cap while the canvas is unmeasured. */
export const scaffoldPanelCapacityAtom = readFamily(
  "panelCapacity",
  (get, id) =>
    get(scaffoldMeasuredCapacityAtom(id)) ?? SCAFFOLD_PANEL_CAPACITY
)

/** Ids of panels currently hidden (auto + user), for tabs to reflect. */
export const scaffoldHiddenPanelIdsAtom = readFamily<readonly string[]>(
  "hiddenPanelIds",
  (get, id) => {
    const visibility = get(scaffoldVisibilityAtom(id))
    return [...visibility.autoHidden, ...visibility.userHidden]
  }
)

/** Whether one panel is hidden. A tab subscribes here and sits still while
 * its siblings toggle. Empty `panelId` (a tab without one) reads false. */
export const scaffoldPanelHiddenAtom = panelFamily(
  "hidden",
  (get, id, panelId) => {
    if (panelId === "") return false
    const visibility = get(scaffoldVisibilityAtom(id))
    return (
      visibility.autoHidden.includes(panelId) ||
      visibility.userHidden.includes(panelId)
    )
  }
)

/** Whether one panel fades back while another panel's tab holds the
 * spotlight. Moving the hover between two tabs re-renders those panels
 * only — everyone else's boolean holds. */
export const scaffoldPanelDimmedAtom = panelFamily(
  "dimmed",
  (get, id, panelId) => {
    if (panelId === "") return false
    const hovered = get(scaffoldHoveredPanelIdAtom(id))
    return hovered !== null && hovered !== panelId
  }
)

/** The whole state of one scaffold. This changes on every hover move, so a
 * component that reads one field should subscribe to that field's atom
 * instead: `useAtomValue(scaffoldInspectorOpenAtom("workspace"))`. */
export const scaffoldStateAtom = readFamily<ScaffoldState>(
  "state",
  (get, id) => ({
    inspectorOpen: get(scaffoldInspectorOpenAtom(id)),
    panelCapacity: get(scaffoldPanelCapacityAtom(id)),
    hiddenPanelIds: get(scaffoldHiddenPanelIdsAtom(id)),
    hoveredPanelId: get(scaffoldHoveredPanelIdAtom(id)),
  })
)

// ── visibility settling ────────────────────────────────────────────────────

/** Re-settle the lists after any input moved. Inert when nothing changes —
 * `reconcileVisibility` returns `prev` untouched then. */
function settleVisibility(get: Getter, set: Setter, id: ScaffoldInstanceId) {
  const prev = get(scaffoldVisibilityAtom(id))
  const settled = reconcileVisibility(
    prev,
    get(scaffoldPanelIdsAtom(id)),
    get(scaffoldPanelCapacityAtom(id))
  )
  if (settled !== prev) set(scaffoldVisibilityAtom(id), settled)
}

// ── actions: inspector ─────────────────────────────────────────────────────

/** Reports through `onInspectorOpenChange` always; writes the store only
 * when no `inspectorOpen` prop controls the root — the prop is truth then. */
export const setScaffoldInspectorOpenAtom = actionFamily<[open: boolean]>(
  "setInspectorOpen",
  (get, set, id, open) => {
    if (get(scaffoldInspectorOpenAtom(id)) === open) return
    if (!get(scaffoldConfigAtom(id)).controlsInspector)
      set(scaffoldInspectorOpenAtom(id), open)
    get(scaffoldHandlersAtom(id)).onInspectorOpenChange?.(open)
  }
)

export const toggleScaffoldInspectorAtom = actionFamily<[]>(
  "toggleInspector",
  (get, set, id) => {
    set(setScaffoldInspectorOpenAtom(id), !get(scaffoldInspectorOpenAtom(id)))
  }
)

// ── actions: panels ────────────────────────────────────────────────────────

/** Show/hide an id'd panel. Showing past capacity auto-hides the
 * least-recently-activated visible panel; the last visible one never hides. */
export const toggleScaffoldPanelAtom = actionFamily<[panelId: string]>(
  "togglePanel",
  (get, set, id, panelId) => {
    const ids = get(scaffoldPanelIdsAtom(id))
    if (!ids.includes(panelId)) return
    const prev = get(scaffoldVisibilityAtom(id))
    const hidden =
      prev.autoHidden.includes(panelId) || prev.userHidden.includes(panelId)
    if (!hidden && prev.visibleOrder.length <= 1) return

    const next: ScaffoldPanelVisibility = hidden
      ? {
          // Showing: newest activation — reconcile evicts the oldest
          // visible panel if the canvas can't fit one more.
          visibleOrder: [...prev.visibleOrder, panelId],
          autoHidden: prev.autoHidden.filter((other) => other !== panelId),
          userHidden: prev.userHidden.filter((other) => other !== panelId),
        }
      : {
          visibleOrder: prev.visibleOrder.filter((other) => other !== panelId),
          autoHidden: prev.autoHidden,
          userHidden: [...prev.userHidden, panelId],
        }
    set(
      scaffoldVisibilityAtom(id),
      reconcileVisibility(next, ids, get(scaffoldPanelCapacityAtom(id)))
    )
  }
)

/** @internal Tabs report pointer enter/leave on their label. Leaving clears
 * only its own id — a tab that unmounts mid-hover must not wipe out a hover
 * the pointer has already moved on to. */
export const setScaffoldPanelHoveredAtom = actionFamily<
  [panelId: string, hovered: boolean]
>("setPanelHovered", (get, set, id, panelId, hovered) => {
  const prev = get(scaffoldHoveredPanelIdAtom(id))
  if (hovered) {
    if (prev !== panelId) set(scaffoldHoveredPanelIdAtom(id), panelId)
    return
  }
  if (prev === panelId) set(scaffoldHoveredPanelIdAtom(id), null)
})

/** @internal Canvas reports its ordered panel ids each render. Inert when
 * the ids did not move; otherwise the visibility settles in the same write. */
export const registerScaffoldPanelIdsAtom = actionFamily<
  [ids: readonly string[]]
>("registerPanelIds", (get, set, id, ids) => {
  const prev = get(scaffoldPanelIdsAtom(id))
  if (prev.length === ids.length && prev.every((v, i) => v === ids[i])) return
  set(scaffoldPanelIdsAtom(id), [...ids])
  settleVisibility(get, set, id)
})

/** @internal Canvas reports its measured width. Only the derived capacity is
 * stored, so resize storms settle to at most one visibility change. */
export const measureScaffoldCanvasAtom = actionFamily<[width: number]>(
  "measureCanvas",
  (get, set, id, width) => {
    const capacity = getPanelCapacity(width)
    if (get(scaffoldMeasuredCapacityAtom(id)) === capacity) return
    set(scaffoldMeasuredCapacityAtom(id), capacity)
    settleVisibility(get, set, id)
  }
)

// ── internal projections ───────────────────────────────────────────────────

/** @internal Projection of the mounted root's controlled props. */
export const projectScaffoldPropsAtom = actionFamily<
  [config: ScaffoldConfig, inspectorOpen: boolean | undefined]
>("projectProps", (_get, set, id, config, inspectorOpen) => {
  set(scaffoldConfigAtom(id), config)
  if (config.controlsInspector && inspectorOpen !== undefined)
    set(scaffoldInspectorOpenAtom(id), inspectorOpen)
})

/** @internal */
export const setScaffoldHandlersAtom = actionFamily<
  [handlers: ScaffoldHandlers]
>("setHandlers", (_get, set, id, handlers) => {
  set(scaffoldHandlersAtom(id), handlers)
})

/** @internal Seed the uncontrolled inspector on mount without firing
 * `onInspectorOpenChange`. */
export const seedScaffoldInspectorAtom = actionFamily<[open: boolean]>(
  "seedInspector",
  (_get, set, id, open) => {
    set(scaffoldInspectorOpenAtom(id), open)
  }
)

// ── reset ──────────────────────────────────────────────────────────────────

export const resetScaffoldAtom = actionFamily<[]>("reset", (_get, set, id) => {
  set(scaffoldInspectorOpenAtom(id), false)
  set(scaffoldPanelIdsAtom(id), NO_PANEL_IDS)
  set(scaffoldMeasuredCapacityAtom(id), null)
  set(scaffoldVisibilityAtom(id), EMPTY_SCAFFOLD_VISIBILITY)
  set(scaffoldHoveredPanelIdAtom(id), null)
  set(scaffoldConfigAtom(id), DEFAULT_CONFIG)
  set(scaffoldHandlersAtom(id), NO_HANDLERS)
})

/** Forget a scaffold entirely — every family drops the key so the store can
 * release its state. Call on teardown of a named instance. */
export function removeScaffoldInstance(id: ScaffoldInstanceId): void {
  for (const family of families) family.remove(id)
}
