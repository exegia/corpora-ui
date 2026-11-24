export { AuthFlowBlock } from "./auth-flow-block"
export { CodeAuthBlock } from "./code-auth-block"
export { ForgotPasswordBlock } from "./forgot-password-block"
export { LinkedAccountsBlock } from "./linked-accounts-block"
export { LoginBlock } from "./login-block"
export { DEFAULT_ONBOARDING_STEPS, OnboardingBlock } from "./onboarding-block"
export { PasskeyManagerBlock } from "./passkey-manager-block"
export { PasskeySignInBlock } from "./passkey-sign-in-block"
export { SignupBlock } from "./signup-block"
export { UpdatePasswordBlock } from "./update-password-block"

// Atoms + hooks. `auth-state` is already the curated public surface — it
// names every export explicitly, so `export *` here can't leak internals.
export * from "./auth-state"
