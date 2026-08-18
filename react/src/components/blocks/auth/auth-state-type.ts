/**
 * Types for the auth coordination state (`auth-flow-atom.ts` /
 * `auth-session-atom.ts`).
 *
 * This file stays dependency-free of the atom modules: types only, no atom
 * imports. The auth blocks themselves are unaware of this layer — they keep
 * field values in local `useState` — these types describe the coordination
 * state an app wires *around* the blocks.
 */
import type { AuthStatus } from "./auth-shell"

export type AuthFlowId = string

/** Which auth block the app is showing. */
export type AuthFlowStep =
  | "login"
  | "signup"
  | "verify-code"
  | "forgot-password"
  | "update-password"
  | "onboarding"
  | "success"

export type AuthFlowChannel = "email" | "sms"

export interface AuthFlowState {
  step: AuthFlowStep
  /** The identifier in flight — an email or phone number. Cleared by reset
   * and by signOut. Never store passwords or codes here. */
  identifier: string | null
  /** `identifier` masked for display — "y•••@example.com", "•••1234". */
  maskedIdentifier: string | null
  channel: AuthFlowChannel
  status: AuthStatus
  error: string | null
}

/** Options for `beginAuthVerificationAtom` / `beginVerification`. */
export interface BeginAuthVerificationOptions {
  identifier: string
  /** @default "email" */
  channel?: AuthFlowChannel
  /** @default "verify-code" */
  step?: AuthFlowStep
}

/** What `useAuthFlowActions(flowId)` returns. */
export interface AuthFlowActions {
  /** Show a step; resets status to `"idle"` and clears the error. Keeps the
   * identifier. */
  goToStep: (step: AuthFlowStep) => void
  /** Record the identifier in flight and move to the verification step. */
  beginVerification: (options: BeginAuthVerificationOptions) => void
  /** Mark the flow `"loading"` while an async attempt is in flight. */
  beginAttempt: () => void
  /** Mark the flow `"error"` with a message. */
  fail: (message: string) => void
  /** Mark the flow `"success"`; when a user is given, also sign the session
   * in. */
  complete: (user?: AuthUser) => void
  /** Back to the initial values (login step, no identifier). */
  reset: () => void
}

/** The signed-in identity, kept for the whole session. Structurally
 * assignable to `ProfileCardUser`, so it drops into `ProfileCardBlock`. */
export interface AuthUser {
  id: string
  name: string
  /** Secondary line — a handle, an email, a role. */
  username?: string
  email?: string
  /** Avatar image URL. */
  avatar?: string
  initials?: string
  /** App-specific extras the library never interprets. */
  metadata?: Record<string, unknown>
}

/** `unknown` until the app restores or rejects a session at boot. */
export type AuthSessionStatus = "unknown" | "unauthenticated" | "authenticated"

export interface AuthSessionState {
  status: AuthSessionStatus
  user: AuthUser | null
}

/** What `useAuthSessionActions()` returns. */
export interface AuthSessionActions {
  signIn: (user: AuthUser) => void
  /** Shallow-merge a patch into the signed-in user; no-op when signed out. */
  updateUser: (patch: Partial<AuthUser>) => void
  /** What an app calls at boot when session restore fails. */
  markUnauthenticated: () => void
  /** Sign out AND return the default auth flow to the login step. */
  signOut: () => void
}
