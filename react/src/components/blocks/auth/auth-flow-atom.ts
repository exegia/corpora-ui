/**
 * Per-instance Jotai state for the auth flow — which auth block the app is
 * showing, the identifier in flight, and the attempt status.
 *
 * Every atom is a module-level family keyed by a flow id, so one
 * `ExegiaProvider` at the app root is enough: a modal login and a full-page
 * login can coexist in one store, and any component can drive a flow by id
 * without holding a controller. Most apps have one flow and use
 * `DEFAULT_AUTH_FLOW_ID`.
 *
 * This is a coordination layer only. The auth blocks keep passwords, codes
 * and field values in local `useState` on purpose — never store those here.
 *
 * Import direction: `auth-session-atom.ts` is the LEAF. This module imports
 * `signInAtom` from it (`completeAuthFlowAtom` signs the session in) and
 * defines the composite `endAuthSessionAtom`; the session module never
 * imports from here.
 */
import { atom } from "jotai"
import type { Getter, Setter } from "jotai"

import { signInAtom, signOutAtom } from "./auth-session-atom"
import type { AuthStatus } from "./auth-shell"
import type {
  AuthFlowChannel,
  AuthFlowId,
  AuthFlowState,
  AuthFlowStep,
  AuthUser,
  BeginAuthVerificationOptions,
} from "./auth-state-type"

export const DEFAULT_AUTH_FLOW_ID: AuthFlowId = "default"

/**
 * A string-keyed atom family (same in-house shape as `tree-atom.ts`:
 * `jotai/utils`' `atomFamily` is deprecated for Jotai v3, and we need only
 * the string-keyed case with a `remove`). Dropping a key lets the store's
 * WeakMap release that instance's state.
 */
type Family<AtomType> = ((id: AuthFlowId) => AtomType) & {
  remove: (id: AuthFlowId) => void
}

/** Every family, so `removeAuthFlowInstance` can drop an id from all. */
const families: { remove: (id: AuthFlowId) => void }[] = []

function keyed<AtomType>(create: (id: AuthFlowId) => AtomType) {
  const cache = new Map<AuthFlowId, AtomType>()
  const family = ((id: AuthFlowId) => {
    let instance = cache.get(id)
    if (instance === undefined) {
      instance = create(id)
      cache.set(id, instance)
    }
    return instance
  }) as Family<AtomType>
  family.remove = (id: AuthFlowId) => {
    cache.delete(id)
  }
  families.push(family)
  return family
}

function stateFamily<Value>(name: string, initialValue: Value) {
  return keyed((id) => {
    const instance = atom(initialValue)
    instance.debugLabel = `auth-flow/${id}/${name}`
    return instance
  })
}

function readFamily<Value>(
  name: string,
  read: (get: Getter, id: AuthFlowId) => Value
) {
  return keyed((id) => {
    const instance = atom((get) => read(get, id))
    instance.debugLabel = `auth-flow/${id}/${name}`
    return instance
  })
}

function actionFamily<Args extends unknown[]>(
  name: string,
  write: (get: Getter, set: Setter, id: AuthFlowId, ...args: Args) => void
) {
  return keyed((id) => {
    const instance = atom(null, (get, set, ...args: Args) =>
      write(get, set, id, ...args)
    )
    instance.debugLabel = `auth-flow/${id}/${name}`
    return instance
  })
}

// ── masking ──────────────────────────────────────────────────────────────

/**
 * Mask an identifier for display. Email → first character of the local part
 * plus `"•••"`, domain intact (`"y•••@example.com"`; a 1-char local part
 * still gets `"y•••@…"`). Non-email (sms) → `"•••"` + last 4 characters;
 * fewer than 4 characters masks everything as `"•••"`.
 */
export function maskAuthIdentifier(identifier: string): string {
  const at = identifier.indexOf("@")
  if (at > 0) return `${identifier[0]}•••${identifier.slice(at)}`
  // At 4 characters or fewer, "keep the last 4" would reveal the whole
  // identifier while implying redaction — mask everything instead.
  if (identifier.length <= 4) return "•••"
  return `•••${identifier.slice(-4)}`
}

// ── primitives ───────────────────────────────────────────────────────────

export const authFlowStepAtom = stateFamily<AuthFlowStep>("step", "login")

/** An email or phone number in flight — never a password or a code. */
export const authFlowIdentifierAtom = stateFamily<string | null>(
  "identifier",
  null
)

export const authFlowChannelAtom = stateFamily<AuthFlowChannel>(
  "channel",
  "email"
)

export const authFlowStatusAtom = stateFamily<AuthStatus>("status", "idle")

export const authFlowErrorAtom = stateFamily<string | null>("error", null)

// ── derived ──────────────────────────────────────────────────────────────

/** `identifier` masked for display, `null` while nothing is in flight. */
export const authFlowMaskedIdentifierAtom = readFamily<string | null>(
  "maskedIdentifier",
  (get, id) => {
    const identifier = get(authFlowIdentifierAtom(id))
    return identifier === null ? null : maskAuthIdentifier(identifier)
  }
)

export const authFlowStateAtom = readFamily<AuthFlowState>(
  "state",
  (get, id) => ({
    step: get(authFlowStepAtom(id)),
    identifier: get(authFlowIdentifierAtom(id)),
    maskedIdentifier: get(authFlowMaskedIdentifierAtom(id)),
    channel: get(authFlowChannelAtom(id)),
    status: get(authFlowStatusAtom(id)),
    error: get(authFlowErrorAtom(id)),
  })
)

// ── actions ──────────────────────────────────────────────────────────────

/** Show a step with a clean slate (`"idle"`, no error). Keeps the
 * identifier so "back to verify" flows don't lose the destination. */
export const goToAuthStepAtom = actionFamily<[step: AuthFlowStep]>(
  "goToStep",
  (_get, set, id, step) => {
    set(authFlowStepAtom(id), step)
    set(authFlowStatusAtom(id), "idle")
    set(authFlowErrorAtom(id), null)
  }
)

/** Record the identifier in flight and move to the verification step. */
export const beginAuthVerificationAtom = actionFamily<
  [options: BeginAuthVerificationOptions]
>(
  "beginVerification",
  (_get, set, id, { identifier, channel = "email", step = "verify-code" }) => {
    set(authFlowIdentifierAtom(id), identifier)
    set(authFlowChannelAtom(id), channel)
    set(authFlowStepAtom(id), step)
    set(authFlowStatusAtom(id), "idle")
    set(authFlowErrorAtom(id), null)
  }
)

/** Mark the flow `"loading"` while an async attempt is in flight. */
export const beginAuthAttemptAtom = actionFamily<[]>(
  "beginAttempt",
  (_get, set, id) => {
    set(authFlowStatusAtom(id), "loading")
    set(authFlowErrorAtom(id), null)
  }
)

export const failAuthFlowAtom = actionFamily<[message: string]>(
  "fail",
  (_get, set, id, message) => {
    set(authFlowStatusAtom(id), "error")
    set(authFlowErrorAtom(id), message)
  }
)

/** Mark the flow `"success"` and land on the success step. When `user` is
 * given, also sign the session in — one atomic write for the whole
 * "verification passed" transition. */
export const completeAuthFlowAtom = actionFamily<[user?: AuthUser]>(
  "complete",
  (_get, set, id, user) => {
    set(authFlowStatusAtom(id), "success")
    set(authFlowErrorAtom(id), null)
    set(authFlowStepAtom(id), "success")
    if (user) set(signInAtom, user)
  }
)

/** Back to the initial values (login step, no identifier, `"email"`,
 * `"idle"`, no error). */
export const resetAuthFlowAtom = actionFamily<[]>("reset", (_get, set, id) => {
  set(authFlowStepAtom(id), "login")
  set(authFlowIdentifierAtom(id), null)
  set(authFlowChannelAtom(id), "email")
  set(authFlowStatusAtom(id), "idle")
  set(authFlowErrorAtom(id), null)
})

/**
 * Sign out and return the default flow to the login step — the one to wire
 * to a logout button. `useAuthSessionActions().signOut` is this atom;
 * `signOutAtom` in `auth-session-atom.ts` clears the session only.
 */
export const endAuthSessionAtom = atom(null, (_get, set) => {
  set(signOutAtom)
  set(resetAuthFlowAtom(DEFAULT_AUTH_FLOW_ID))
})
endAuthSessionAtom.debugLabel = "auth-flow/endAuthSession"

/** Drop every atom for `id`. Call on teardown of an explicit flow id; the
 * default flow usually just gets `resetAuthFlowAtom`. */
export function removeAuthFlowInstance(id: AuthFlowId): void {
  for (const family of families) family.remove(id)
}
