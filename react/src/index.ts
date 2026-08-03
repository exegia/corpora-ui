/**
 * npm library entry point (`@corpora/ui`).
 *
 * Export every published component here — atoms from `components/ui`,
 * compositions from `components/composed`, blocks from `components/blocks`.
 * The docs site (main.tsx + routes.tsx + pages/) is NOT part of the package.
 */

// atoms
export * from "./components/ui/avatar"
export * from "./components/ui/button"
export * from "./components/ui/card"
export * from "./components/ui/checkbox"
export * from "./components/ui/field"
export * from "./components/ui/frame"
export * from "./components/ui/input"
export * from "./components/ui/input-group"
export * from "./components/ui/label"
export * from "./components/ui/menu"
export * from "./components/ui/otp-field"
export * from "./components/ui/separator"
export * from "./components/ui/skeleton"
export * from "./components/ui/spinner"
export * from "./components/ui/textarea"

// components
export * from "./components/composed/password-input"
export * from "./components/composed/social-providers"
export * from "./components/composed/user-avatar"

// blocks
export * from "./components/blocks/auth/auth-shell"
export * from "./components/blocks/auth/code-auth-block"
export * from "./components/blocks/auth/forgot-password-block"
export * from "./components/blocks/auth/linked-accounts-block"
export * from "./components/blocks/auth/login-block"
export * from "./components/blocks/auth/onboarding-block"
export * from "./components/blocks/auth/passkey-manager-block"
export * from "./components/blocks/auth/passkey-sign-in-block"
export * from "./components/blocks/auth/signup-block"
export * from "./components/blocks/auth/update-password-block"
export * from "./components/blocks/nav/sidebar-block"
export * from "./components/blocks/profile/profile-card-block"

// motion primitives
export * from "./components/motion/animated-sidebar"
export * from "./components/motion/shared-layout-bg"

// lib
export * from "./lib/auth-accent"
export * from "./lib/ease"
export * from "./lib/sound"
export * from "./lib/utils"
