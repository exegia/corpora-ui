/**
 * Session state for the auth blocks — singleton atoms, deliberately NOT a
 * family.
 *
 * A session is one-per-store: one signed-in user per app (per
 * `ExegiaProvider` store; SSR isolation comes from passing a fresh store).
 * Instance keying is for multi-instance components; a family here would
 * imply several concurrent users and be a lie.
 *
 * Import direction: this module is the LEAF — it imports nothing from
 * `auth-flow-atom.ts`. The flow module imports `signInAtom` from here (for
 * `completeAuthFlowAtom`) and defines the composite `endAuthSessionAtom`
 * that pairs `signOutAtom` with a flow reset. `signOutAtom` below clears the
 * session only.
 */
import { atom } from "jotai"

import type {
  AuthSessionState,
  AuthSessionStatus,
  AuthUser,
} from "./auth-state-type"

// ── primitives ───────────────────────────────────────────────────────────

/** `"unknown"` until the app restores or rejects a session at boot. */
export const authSessionStatusAtom = atom<AuthSessionStatus>("unknown")
authSessionStatusAtom.debugLabel = "auth-session/status"

export const authUserAtom = atom<AuthUser | null>(null)
authUserAtom.debugLabel = "auth-session/user"

// ── derived ──────────────────────────────────────────────────────────────

export const isAuthenticatedAtom = atom(
  (get) => get(authSessionStatusAtom) === "authenticated"
)
isAuthenticatedAtom.debugLabel = "auth-session/isAuthenticated"

export const authSessionStateAtom = atom<AuthSessionState>((get) => ({
  status: get(authSessionStatusAtom),
  user: get(authUserAtom),
}))
authSessionStateAtom.debugLabel = "auth-session/state"

// ── actions ──────────────────────────────────────────────────────────────

export const signInAtom = atom(null, (_get, set, user: AuthUser) => {
  set(authUserAtom, user)
  set(authSessionStatusAtom, "authenticated")
})
signInAtom.debugLabel = "auth-session/signIn"

export const updateAuthUserAtom = atom(
  null,
  (get, set, patch: Partial<AuthUser>) => {
    const user = get(authUserAtom)
    // No-op when signed out: there is no user to merge into, and inventing
    // one from a partial patch would fabricate an identity.
    if (user === null) return
    set(authUserAtom, { ...user, ...patch })
  }
)
updateAuthUserAtom.debugLabel = "auth-session/updateUser"

/** What an app calls at boot when session restore fails. */
export const markUnauthenticatedAtom = atom(null, (_get, set) => {
  set(authSessionStatusAtom, "unauthenticated")
  set(authUserAtom, null)
})
markUnauthenticatedAtom.debugLabel = "auth-session/markUnauthenticated"

/**
 * Clears the session only. Most consumers want `endAuthSessionAtom` from
 * `auth-flow-atom.ts` instead, which also returns the default flow to the
 * login step — the hooks expose that one as `signOut`.
 */
export const signOutAtom = atom(null, (_get, set) => {
  set(authUserAtom, null)
  set(authSessionStatusAtom, "unauthenticated")
})
signOutAtom.debugLabel = "auth-session/signOut"
