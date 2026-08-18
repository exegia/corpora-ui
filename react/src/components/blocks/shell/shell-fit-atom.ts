/**
 * Per-instance Jotai state for the shell's layout fit.
 *
 * Every atom is a module-level family keyed by a shell id, so one
 * `ExegiaProvider` at the app root is enough: several shells coexist in one
 * store without a provider each, and a title bar, a command palette or a
 * layout test can drive one by id without holding its controller.
 *
 * Unlike the tree, this feature has no controlled props — the shell measures
 * itself, nobody hands it a viewport. So, like `blocks/auth`'s coordination
 * layer, there is no config atom, no projection and no owned-* loop guard.
 * `useShellFit` is the only writer of `metrics`, and that write is silent by
 * design: a resize is not an event an app subscribed to.
 *
 * The rule itself lives in `shell-metrics.ts` and is called from here, so the
 * arithmetic has one home whether it is read through a hook or a store.
 */
import { atom } from "jotai"
import type { Getter, Setter } from "jotai"

import {
  clampPanelWidth,
  fitsPanel,
  metricsEqual,
  panelBounds,
  type ShellMetrics,
} from "./shell-metrics"
import type {
  ShellFitInstanceId,
  ShellFitPanelBounds,
  ShellFitSeed,
  ShellFitState,
} from "./type"

/** An unmeasured shell. Zeroes read as "no layout yet", which the rule fails
 * open on rather than hiding a panel over a reading it never took. */
const NO_METRICS: ShellMetrics = {
  rail: 0,
  insetMin: 0,
  panelMin: 0,
  viewport: 0,
  chrome: 0,
}

/** A panel that mounts at `--panel-width`. */
const DEFAULT_SHELL_FIT_SEED: ShellFitSeed = { panelWidth: null }

const NO_BOUNDS: ShellFitPanelBounds = { min: 0, max: 0 }

/**
 * A string-keyed atom family.
 *
 * `jotai/utils`' `atomFamily` is deprecated for Jotai v3, and we need only
 * the string-keyed case with a `remove` — so this stays in-house rather than
 * adding `jotai-family` as a second Jotai package to keep version-aligned.
 * Dropping a key lets the store's WeakMap release that instance's state.
 */
type Family<AtomType> = ((id: ShellFitInstanceId) => AtomType) & {
  remove: (id: ShellFitInstanceId) => void
}

/** Every family, so `removeShellFitInstance` can drop an id from all of them. */
const families: { remove: (id: ShellFitInstanceId) => void }[] = []

function keyed<AtomType>(create: (id: ShellFitInstanceId) => AtomType) {
  const cache = new Map<ShellFitInstanceId, AtomType>()
  const family = ((id: ShellFitInstanceId) => {
    let instance = cache.get(id)
    if (instance === undefined) {
      instance = create(id)
      cache.set(id, instance)
    }
    return instance
  }) as Family<AtomType>
  family.remove = (id: ShellFitInstanceId) => {
    cache.delete(id)
  }
  families.push(family)
  return family
}

function stateFamily<Value>(name: string, initialValue: Value) {
  return keyed((id) => {
    const instance = atom(initialValue)
    instance.debugLabel = `shell-fit/${id}/${name}`
    return instance
  })
}

function readFamily<Value>(
  name: string,
  read: (get: Getter, id: ShellFitInstanceId) => Value
) {
  return keyed((id) => {
    const instance = atom((get) => read(get, id))
    instance.debugLabel = `shell-fit/${id}/${name}`
    return instance
  })
}

function actionFamily<Args extends unknown[]>(
  name: string,
  write: (
    get: Getter,
    set: Setter,
    id: ShellFitInstanceId,
    ...args: Args
  ) => void
) {
  return keyed((id) => {
    const instance = atom(null, (get, set, ...args: Args) =>
      write(get, set, id, ...args)
    )
    instance.debugLabel = `shell-fit/${id}/${name}`
    return instance
  })
}

/** The shell's own measurement of its columns. `useShellFit` is the only
 * writer; read `shellFitMeasuredAtom` to get it with the "no layout yet" case
 * already resolved. */
export const shellFitMetricsAtom = stateFamily<ShellMetrics>(
  "metrics",
  NO_METRICS
)

/** The width the user dragged to, before clamping — null while the panel sits
 * at `--panel-width`. Read `shellFitPanelWidthAtom` for the width the panel
 * actually renders at: clamping on read is what lets a narrowing viewport
 * pull the panel down without forgetting the width they asked for. */
export const shellFitRequestedWidthAtom = stateFamily<number | null>(
  "requestedWidth",
  null
)

const shellFitSeedAtom = stateFamily<ShellFitSeed>(
  "seed",
  DEFAULT_SHELL_FIT_SEED
)
const shellFitInitializedAtom = stateFamily<boolean>("initialized", false)

/** The metrics, or null when the shell has no layout to report — a server
 * render, a `display: none` host, a test with no layout engine. A zero is not
 * a width, and treating it as one would pin the panel to nothing. */
export const shellFitMeasuredAtom = readFamily<ShellMetrics | null>(
  "measured",
  (get, id) => {
    const metrics = get(shellFitMetricsAtom(id))
    return metrics.panelMin > 0 ? metrics : null
  }
)

/** Whether the shell can hold a secondary panel at all. */
export const shellFitFitsAtom = readFamily("fits", (get, id) =>
  fitsPanel(get(shellFitMetricsAtom(id)))
)

/** The range a resize may land in. */
export const shellFitPanelBoundsAtom = readFamily<ShellFitPanelBounds>(
  "panelBounds",
  (get, id) => {
    const measured = get(shellFitMeasuredAtom(id))
    return measured ? panelBounds(measured) : NO_BOUNDS
  }
)

/** The width the secondary panel renders at, or null before the first
 * measurement, where the caller falls back to `--panel-width`. */
export const shellFitPanelWidthAtom = readFamily<number | null>(
  "panelWidth",
  (get, id) => {
    const measured = get(shellFitMeasuredAtom(id))
    if (!measured) return null
    const requested = get(shellFitRequestedWidthAtom(id))
    return clampPanelWidth(requested ?? measured.panelMin, measured)
  }
)

/** The whole fit of one shell. This changes on every measurement, so a
 * component that reads one field should subscribe to that field's atom
 * instead: `useAtomValue(shellFitFitsAtom("app-shell"))`. */
export const shellFitStateAtom = readFamily<ShellFitState>(
  "state",
  (get, id) => ({
    metrics: get(shellFitMeasuredAtom(id)),
    fits: get(shellFitFitsAtom(id)),
    panelWidth: get(shellFitPanelWidthAtom(id)),
    bounds: get(shellFitPanelBoundsAtom(id)),
  })
)

/** @internal The measurement's way in. Silent, and inert when the numbers did
 * not move — a resize event that changes nothing must not re-render a shell. */
export const measureShellFitAtom = actionFamily<[metrics: ShellMetrics]>(
  "measure",
  (get, set, id, metrics) => {
    if (metricsEqual(get(shellFitMetricsAtom(id)), metrics)) return
    set(shellFitMetricsAtom(id), metrics)
  }
)

/** Resize the secondary panel. Clamped on the way in, so a drag past the
 * gutter parks at the bound instead of banking travel it has to give back —
 * and a caller with no idea how wide the shell is can still ask for 900. */
export const resizeShellPanelAtom = actionFamily<[width: number]>(
  "resizePanel",
  (get, set, id, width) => {
    const measured = get(shellFitMeasuredAtom(id))
    set(
      shellFitRequestedWidthAtom(id),
      measured ? clampPanelWidth(width, measured) : width
    )
  }
)

/** Back to the width the shell mounted with — `defaultPanelWidth`, or
 * `--panel-width` when there was none. */
export const resetShellPanelWidthAtom = actionFamily<[]>(
  "resetPanelWidth",
  (get, set, id) => {
    set(shellFitRequestedWidthAtom(id), get(shellFitSeedAtom(id)).panelWidth)
  }
)

/** @internal Seed the instance once. A seed describes the mount, not every
 * render, so a `defaultPanelWidth` that arrives later never overwrites a
 * width the user dragged to. */
export const mountShellFitAtom = actionFamily<[seed: ShellFitSeed]>(
  "mount",
  (get, set, id, seed) => {
    if (get(shellFitInitializedAtom(id))) return
    set(shellFitInitializedAtom(id), true)
    set(shellFitSeedAtom(id), seed)
    set(shellFitRequestedWidthAtom(id), seed.panelWidth)
  }
)

/** Drop every atom for `id`. `useShellFit` calls this on unmount for shells it
 * keyed itself; an explicit `shellId` is the app's key and outlives its
 * component, so a resized panel survives a route change. */
export function removeShellFitInstance(id: ShellFitInstanceId): void {
  for (const family of families) family.remove(id)
}
