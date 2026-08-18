"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  DEFAULT_AUTH_FLOW_ID,
  authFlowStateAtom,
  beginAuthAttemptAtom,
  beginAuthVerificationAtom,
  completeAuthFlowAtom,
  endAuthSessionAtom,
  failAuthFlowAtom,
  goToAuthStepAtom,
  resetAuthFlowAtom,
} from "./auth-flow-atom"
import {
  authSessionStateAtom,
  isAuthenticatedAtom,
  markUnauthenticatedAtom,
  signInAtom,
  updateAuthUserAtom,
} from "./auth-session-atom"
import type {
  AuthFlowActions,
  AuthFlowId,
  AuthFlowState,
  AuthSessionActions,
  AuthSessionState,
} from "./auth-state-type"

/**
 * Read the auth flow registered under `flowId` from anywhere below
 * `ExegiaProvider`. Pairs with `useAuthFlowActions` to wire the auth blocks
 * into one flow — the blocks keep passwords and codes in local state, the
 * flow tracks which block shows and what identifier is in flight:
 *
 * ```tsx
 * const flow = useAuthFlow()
 * const { beginVerification, complete, fail } = useAuthFlowActions()
 *
 * {flow.step === "login" && (
 *   <LoginBlock
 *     onSubmit={async ({ email }) => {
 *       await api.requestCode(email)
 *       beginVerification({ identifier: email })
 *     }}
 *   />
 * )}
 * {flow.step === "verify-code" && (
 *   <CodeAuthBlock
 *     destination={flow.maskedIdentifier ?? undefined}
 *     onVerify={async (code) => complete(await api.verify(code))}
 *   />
 * )}
 * ```
 *
 * This returns the whole state object, so the caller re-renders on any
 * change. A component that reads one field should subscribe to that field's
 * atom instead: `useAtomValue(authFlowStepAtom(flowId))`.
 */
export function useAuthFlow(
  flowId: AuthFlowId = DEFAULT_AUTH_FLOW_ID
): AuthFlowState {
  return useAtomValue(authFlowStateAtom(flowId))
}

/**
 * Drive the auth flow registered under `flowId` from anywhere. Writes only —
 * the caller never re-renders when the flow changes. See `useAuthFlow` for
 * the intended wiring; a block's submit handler typically runs
 * `beginAttempt()` → the API call → `complete(user)` or `fail(message)`.
 */
export function useAuthFlowActions(
  flowId: AuthFlowId = DEFAULT_AUTH_FLOW_ID
): AuthFlowActions {
  const goToStep = useSetAtom(goToAuthStepAtom(flowId))
  const beginVerification = useSetAtom(beginAuthVerificationAtom(flowId))
  const beginAttempt = useSetAtom(beginAuthAttemptAtom(flowId))
  const fail = useSetAtom(failAuthFlowAtom(flowId))
  const complete = useSetAtom(completeAuthFlowAtom(flowId))
  const reset = useSetAtom(resetAuthFlowAtom(flowId))

  return React.useMemo(
    () => ({
      goToStep,
      beginVerification,
      beginAttempt,
      fail,
      complete,
      reset,
    }),
    [goToStep, beginVerification, beginAttempt, fail, complete, reset]
  )
}

/**
 * Read the session: `status` (`"unknown"` until the app restores or rejects
 * a session at boot), the signed-in `user`, and derived `isAuthenticated`.
 */
export function useAuthSession(): AuthSessionState & {
  isAuthenticated: boolean
} {
  const state = useAtomValue(authSessionStateAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  return React.useMemo(
    () => ({ ...state, isAuthenticated }),
    [state, isAuthenticated]
  )
}

/**
 * Drive the session. Writes only. `signOut` is the composite
 * `endAuthSessionAtom`: it clears the session AND returns the default flow
 * to the login step — the one to wire to a logout button.
 */
export function useAuthSessionActions(): AuthSessionActions {
  const signIn = useSetAtom(signInAtom)
  const updateUser = useSetAtom(updateAuthUserAtom)
  const markUnauthenticated = useSetAtom(markUnauthenticatedAtom)
  const signOut = useSetAtom(endAuthSessionAtom)

  return React.useMemo(
    () => ({ signIn, updateUser, markUnauthenticated, signOut }),
    [signIn, updateUser, markUnauthenticated, signOut]
  )
}
