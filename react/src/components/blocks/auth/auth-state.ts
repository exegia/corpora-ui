/**
 * Public barrel for the auth coordination state. Explicit named exports
 * only — never `export *` from the atom modules, so internals can move
 * without becoming a breaking-change surface.
 */
export {
  DEFAULT_AUTH_FLOW_ID,
  authFlowChannelAtom,
  authFlowErrorAtom,
  authFlowIdentifierAtom,
  authFlowMaskedIdentifierAtom,
  authFlowStateAtom,
  authFlowStatusAtom,
  authFlowStepAtom,
  beginAuthAttemptAtom,
  beginAuthVerificationAtom,
  completeAuthFlowAtom,
  endAuthSessionAtom,
  failAuthFlowAtom,
  goToAuthStepAtom,
  maskAuthIdentifier,
  removeAuthFlowInstance,
  resetAuthFlowAtom,
} from "./auth-flow-atom"
export {
  authSessionStateAtom,
  authSessionStatusAtom,
  authUserAtom,
  isAuthenticatedAtom,
  markUnauthenticatedAtom,
  signInAtom,
  signOutAtom,
  updateAuthUserAtom,
} from "./auth-session-atom"
export {
  useAuthFlow,
  useAuthFlowActions,
  useAuthSession,
  useAuthSessionActions,
} from "./use-auth-state"
export type {
  AuthFlowActions,
  AuthFlowChannel,
  AuthFlowId,
  AuthFlowState,
  AuthFlowStep,
  AuthSessionActions,
  AuthSessionState,
  AuthSessionStatus,
  AuthUser,
  BeginAuthVerificationOptions,
} from "./auth-state-type"
