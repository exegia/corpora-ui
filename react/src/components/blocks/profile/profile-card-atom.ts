/**
 * Profile card state — Jotai atom families keyed by a card id.
 *
 * Same layout as the tree (`components/composed/tree/tree-atom.ts`) and the
 * avatar (`components/user-avatar/user-avatar-atom.ts`): in-house `keyed()`
 * families per field, write-only action atoms, a composed read-only state
 * atom, and `removeProfileCardInstance` to drop an id from every family.
 */

import { atom } from "jotai"
import type { Getter, Setter } from "jotai"

import type {
  ProfileCardAction,
  ProfileCardConfig,
  ProfileCardHandlers,
  ProfileCardInstanceId,
  ProfileCardState,
  ProfileCardVariant,
} from "./type"

const DEFAULT_CONFIG: ProfileCardConfig = {
  controlsVariant: false,
  controlsMenuOpen: false,
}
const NO_HANDLERS: ProfileCardHandlers = {}

// ── families ───────────────────────────────────────────────────────────────

type Family<AtomType> = ((id: ProfileCardInstanceId) => AtomType) & {
  remove: (id: ProfileCardInstanceId) => void
}

const families: { remove: (id: ProfileCardInstanceId) => void }[] = []

function keyed<AtomType>(create: (id: ProfileCardInstanceId) => AtomType) {
  const cache = new Map<ProfileCardInstanceId, AtomType>()
  const family = ((id: ProfileCardInstanceId) => {
    let instance = cache.get(id)
    if (instance === undefined) {
      instance = create(id)
      cache.set(id, instance)
    }
    return instance
  }) as Family<AtomType>
  family.remove = (id: ProfileCardInstanceId) => {
    cache.delete(id)
  }
  families.push(family)
  return family
}

function stateFamily<Value>(name: string, initialValue: Value) {
  return keyed((id) => {
    const instance = atom(initialValue)
    instance.debugLabel = `profileCard/${id}/${name}`
    return instance
  })
}

function readFamily<Value>(
  name: string,
  read: (get: Getter, id: ProfileCardInstanceId) => Value
) {
  return keyed((id) => {
    const instance = atom((get) => read(get, id))
    instance.debugLabel = `profileCard/${id}/${name}`
    return instance
  })
}

function actionFamily<Args extends unknown[]>(
  name: string,
  write: (
    get: Getter,
    set: Setter,
    id: ProfileCardInstanceId,
    ...args: Args
  ) => void
) {
  return keyed((id) => {
    const instance = atom(null, (get, set, ...args: Args) =>
      write(get, set, id, ...args)
    )
    instance.debugLabel = `profileCard/${id}/${name}`
    return instance
  })
}

// ── primitives ─────────────────────────────────────────────────────────────

export const profileCardVariantAtom = stateFamily<ProfileCardVariant>(
  "variant",
  "expanded"
)

export const profileCardMenuOpenAtom = stateFamily<boolean>("menuOpen", false)

export const profileCardPendingActionIdAtom = stateFamily<string | null>(
  "pendingActionId",
  null
)

/** @internal */
export const profileCardConfigAtom = stateFamily<ProfileCardConfig>(
  "config",
  DEFAULT_CONFIG
)

/** @internal */
export const profileCardHandlersAtom = stateFamily<ProfileCardHandlers>(
  "handlers",
  NO_HANDLERS
)

// ── derived ────────────────────────────────────────────────────────────────

export const profileCardCollapsedAtom = readFamily(
  "collapsed",
  (get, id) => get(profileCardVariantAtom(id)) === "collapsed"
)

export const profileCardBusyAtom = readFamily(
  "busy",
  (get, id) => get(profileCardPendingActionIdAtom(id)) !== null
)

/** Whole-state read for callers that want the object; the field atoms are
 * cheaper for components that watch one thing. */
export const profileCardStateAtom = readFamily<ProfileCardState>(
  "state",
  (get, id) => ({
    variant: get(profileCardVariantAtom(id)),
    menuOpen: get(profileCardMenuOpenAtom(id)),
    pendingActionId: get(profileCardPendingActionIdAtom(id)),
    busy: get(profileCardBusyAtom(id)),
  })
)

// ── actions: variant ───────────────────────────────────────────────────────

/** Reports through `onVariantChange` always; writes the store only when no
 * `variant` prop controls the card — the prop is truth then. */
export const setProfileCardVariantAtom = actionFamily<
  [variant: ProfileCardVariant]
>("setVariant", (get, set, id, variant) => {
  if (get(profileCardVariantAtom(id)) === variant) return
  if (!get(profileCardConfigAtom(id)).controlsVariant)
    set(profileCardVariantAtom(id), variant)
  get(profileCardHandlersAtom(id)).onVariantChange?.(variant)
})

export const toggleProfileCardVariantAtom = actionFamily<[]>(
  "toggleVariant",
  (get, set, id) => {
    set(
      setProfileCardVariantAtom(id),
      get(profileCardVariantAtom(id)) === "collapsed" ? "expanded" : "collapsed"
    )
  }
)

// ── actions: menu ──────────────────────────────────────────────────────────

/** Inert while an `open` prop controls the menu. */
export const setProfileCardMenuOpenAtom = actionFamily<[open: boolean]>(
  "setMenuOpen",
  (get, set, id, open) => {
    if (get(profileCardConfigAtom(id)).controlsMenuOpen) return
    set(profileCardMenuOpenAtom(id), open)
  }
)

// ── actions: selection ─────────────────────────────────────────────────────

/**
 * Run an action's `onSelect`. A returned promise marks the card busy until it
 * settles; a rejection goes to `onError` and the card leaves its busy state
 * either way. Because the pending id is a store value, it survives the card
 * unmounting mid-flight (sign-out typically unmounts it) — the settle just
 * writes to an instance nobody renders any more.
 */
export const selectProfileCardActionAtom = actionFamily<
  [action: ProfileCardAction]
>("selectAction", (get, set, id, action) => {
  const result = action.onSelect?.()
  if (!(result instanceof Promise)) return
  set(profileCardPendingActionIdAtom(id), action.id)
  result
    .catch((cause: unknown) => get(profileCardHandlersAtom(id)).onError?.(cause))
    .finally(() => {
      // Only clear our own flight — a later action may have taken over.
      if (get(profileCardPendingActionIdAtom(id)) === action.id)
        set(profileCardPendingActionIdAtom(id), null)
    })
})

// ── internal projections ───────────────────────────────────────────────────

/** @internal Projection of the mounted component's controlled props. */
export const projectProfileCardPropsAtom = actionFamily<
  [
    config: ProfileCardConfig,
    variant: ProfileCardVariant | undefined,
    menuOpen: boolean | undefined,
  ]
>("projectProps", (_get, set, id, config, variant, menuOpen) => {
  set(profileCardConfigAtom(id), config)
  if (config.controlsVariant && variant !== undefined)
    set(profileCardVariantAtom(id), variant)
  if (config.controlsMenuOpen && menuOpen !== undefined)
    set(profileCardMenuOpenAtom(id), menuOpen)
})

/** @internal */
export const setProfileCardHandlersAtom = actionFamily<
  [handlers: ProfileCardHandlers]
>("setHandlers", (_get, set, id, handlers) => {
  set(profileCardHandlersAtom(id), handlers)
})

/** @internal Seed the uncontrolled variant on mount without firing
 * `onVariantChange`. */
export const seedProfileCardVariantAtom = actionFamily<
  [variant: ProfileCardVariant]
>("seedVariant", (_get, set, id, variant) => {
  set(profileCardVariantAtom(id), variant)
})

// ── reset ──────────────────────────────────────────────────────────────────

export const resetProfileCardAtom = actionFamily<[]>(
  "reset",
  (_get, set, id) => {
    set(profileCardVariantAtom(id), "expanded")
    set(profileCardMenuOpenAtom(id), false)
    set(profileCardPendingActionIdAtom(id), null)
    set(profileCardConfigAtom(id), DEFAULT_CONFIG)
    set(profileCardHandlersAtom(id), NO_HANDLERS)
  }
)

/** Forget a card entirely — every family drops the key so the store can
 * release its state. Call on teardown of a named instance. */
export function removeProfileCardInstance(id: ProfileCardInstanceId): void {
  for (const family of families) family.remove(id)
}
