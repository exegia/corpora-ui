/**
 * User avatar state — Jotai atom families keyed by an avatar id.
 *
 * Follows the tree's layout (`components/composed/tree/tree-atom.ts`): one
 * in-house `keyed()` family per field, write-only action atoms for every
 * mutation, a composed read-only state atom, and `removeUserAvatarInstance`
 * to drop an id from every family. Nothing here touches the DOM — the
 * pointer maths that feeds `bezelAngle` lives in `use-user-avatar.ts`.
 */

import { atom } from "jotai"
import type { Getter, Setter } from "jotai"

import type {
  ImageStatus,
  UserAvatarConfig,
  UserAvatarInstanceId,
  UserAvatarState,
  UserPresence,
} from "./type"

/** Light from the top-left, the classic emboss, until a pointer moves. */
export const DEFAULT_BEZEL_ANGLE = 315

const DEFAULT_CONFIG: UserAvatarConfig = { controlsPresence: false }

// ── families ───────────────────────────────────────────────────────────────

type Family<AtomType> = ((id: UserAvatarInstanceId) => AtomType) & {
  remove: (id: UserAvatarInstanceId) => void
}

const families: { remove: (id: UserAvatarInstanceId) => void }[] = []

function keyed<AtomType>(create: (id: UserAvatarInstanceId) => AtomType) {
  const cache = new Map<UserAvatarInstanceId, AtomType>()
  const family = ((id: UserAvatarInstanceId) => {
    let instance = cache.get(id)
    if (instance === undefined) {
      instance = create(id)
      cache.set(id, instance)
    }
    return instance
  }) as Family<AtomType>
  family.remove = (id: UserAvatarInstanceId) => {
    cache.delete(id)
  }
  families.push(family)
  return family
}

function stateFamily<Value>(name: string, initialValue: Value) {
  return keyed((id) => {
    const instance = atom(initialValue)
    instance.debugLabel = `userAvatar/${id}/${name}`
    return instance
  })
}

function readFamily<Value>(
  name: string,
  read: (get: Getter, id: UserAvatarInstanceId) => Value
) {
  return keyed((id) => {
    const instance = atom((get) => read(get, id))
    instance.debugLabel = `userAvatar/${id}/${name}`
    return instance
  })
}

function actionFamily<Args extends unknown[]>(
  name: string,
  write: (
    get: Getter,
    set: Setter,
    id: UserAvatarInstanceId,
    ...args: Args
  ) => void
) {
  return keyed((id) => {
    const instance = atom(null, (get, set, ...args: Args) =>
      write(get, set, id, ...args)
    )
    instance.debugLabel = `userAvatar/${id}/${name}`
    return instance
  })
}

// ── primitives ─────────────────────────────────────────────────────────────

/** `null` = no badge. */
export const userAvatarPresenceAtom = stateFamily<UserPresence | null>(
  "presence",
  null
)

/** Degrees clockwise from 12 o'clock — where the bezel highlight sits. */
export const userAvatarBezelAngleAtom = stateFamily<number>(
  "bezelAngle",
  DEFAULT_BEZEL_ANGLE
)

export const userAvatarImageStatusAtom = stateFamily<ImageStatus>(
  "imageStatus",
  "idle"
)

/** Rim lightness of the loaded image, `null` until sampled (or unsampleable). */
export const userAvatarImageToneAtom = stateFamily<number | null>(
  "imageTone",
  null
)

/** @internal Which fields the mounted component controls from props. */
export const userAvatarConfigAtom = stateFamily<UserAvatarConfig>(
  "config",
  DEFAULT_CONFIG
)

// ── derived ────────────────────────────────────────────────────────────────

export const userAvatarIsOnlineAtom = readFamily(
  "isOnline",
  (get, id) => get(userAvatarPresenceAtom(id)) === "online"
)

/** Whole-state read for callers that want the object; field atoms above are
 * cheaper for components that watch one thing. */
export const userAvatarStateAtom = readFamily<UserAvatarState>(
  "state",
  (get, id) => ({
    presence: get(userAvatarPresenceAtom(id)),
    bezelAngle: get(userAvatarBezelAngleAtom(id)),
    imageStatus: get(userAvatarImageStatusAtom(id)),
    imageTone: get(userAvatarImageToneAtom(id)),
  })
)

// ── actions ────────────────────────────────────────────────────────────────

/** Inert while a `presence` prop controls the avatar — the prop is truth. */
export const setUserAvatarPresenceAtom = actionFamily<
  [presence: UserPresence | null]
>("setPresence", (get, set, id, presence) => {
  if (get(userAvatarConfigAtom(id)).controlsPresence) return
  set(userAvatarPresenceAtom(id), presence)
})

/** online ⇄ offline; a badge-less avatar comes online. */
export const toggleUserAvatarPresenceAtom = actionFamily<[]>(
  "togglePresence",
  (get, set, id) => {
    const next = get(userAvatarPresenceAtom(id)) === "online" ? "offline" : "online"
    set(setUserAvatarPresenceAtom(id), next)
  }
)

/** Stored as given — continuous, not wrapped into [0, 360): the rim is
 * rotated with a CSS transition, and an unwrapped angle is what lets a
 * 359° → 1° move take the short way round. Written on every pointer frame,
 * so it stays a bare set — no config gate, no side effects. */
export const setUserAvatarBezelAngleAtom = actionFamily<[angle: number]>(
  "setBezelAngle",
  (_get, set, id, angle) => {
    if (!Number.isFinite(angle)) return
    set(userAvatarBezelAngleAtom(id), angle)
  }
)

/** @internal Reported by the image element; drives the skeleton. */
export const setUserAvatarImageStatusAtom = actionFamily<[status: ImageStatus]>(
  "setImageStatus",
  (_get, set, id, status) => {
    set(userAvatarImageStatusAtom(id), status)
  }
)

/** @internal Written by the hook once the loaded image has been sampled;
 * cleared (null) when the image changes or goes away. Clamped to [0, 1]. */
export const setUserAvatarImageToneAtom = actionFamily<[tone: number | null]>(
  "setImageTone",
  (_get, set, id, tone) => {
    set(
      userAvatarImageToneAtom(id),
      tone === null || !Number.isFinite(tone) ? null : Math.min(1, Math.max(0, tone))
    )
  }
)

/** @internal Projection of the mounted component's controlled props. */
export const projectUserAvatarPropsAtom = actionFamily<
  [config: UserAvatarConfig, presence: UserPresence | null | undefined]
>("projectProps", (get, set, id, config, presence) => {
  const wasControlled = get(userAvatarConfigAtom(id)).controlsPresence
  set(userAvatarConfigAtom(id), config)
  if (config.controlsPresence) set(userAvatarPresenceAtom(id), presence ?? null)
  // Releasing control (`presence` prop → undefined) clears the badge rather
  // than leaving the last projected value stranded in the store — going
  // from "online" to no presence is a real transition for a user object.
  else if (wasControlled) set(userAvatarPresenceAtom(id), null)
})

export const resetUserAvatarAtom = actionFamily<[]>(
  "reset",
  (_get, set, id) => {
    set(userAvatarPresenceAtom(id), null)
    set(userAvatarBezelAngleAtom(id), DEFAULT_BEZEL_ANGLE)
    set(userAvatarImageStatusAtom(id), "idle")
    set(userAvatarImageToneAtom(id), null)
    set(userAvatarConfigAtom(id), DEFAULT_CONFIG)
  }
)

/** Forget an avatar entirely — every family drops the key so the store can
 * release its state. Call on teardown of a named instance. */
export function removeUserAvatarInstance(id: UserAvatarInstanceId): void {
  for (const family of families) family.remove(id)
}
