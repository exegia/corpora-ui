/**
 * npm library entry point (`@corpora/ui`).
 *
 * Export every published component here — atoms from `components/ui`,
 * compositions from `components/composed`, blocks from `components/blocks`.
 * The docs site (main.tsx + routes.tsx + pages/) is NOT part of the package.
 */

// atoms
export * from "./components/atoms"
// ui/avatar: named, not `export *` — the atoms barrel above owns the bare
// `Avatar` name (the composed identity disc); these are the raw primitives.
export {
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./components/ui/avatar"
export * from "./components/ui/button"
export * from "./components/ui/card"
export * from "./components/ui/checkbox"
export * from "./components/ui/field"
export * from "./components/ui/frame"
export * from "./components/ui/input"
export * from "./components/ui/input-group"
export * from "./components/ui/label"
export * from "./components/ui/menu"
export * from "./components/ui/menu-command"
export * from "./components/ui/context-menu"
export * from "./components/ui/toast"
export * from "./components/ui/modal"
export * from "./components/ui/popover"
export * from "./components/ui/tooltip"
export * from "./components/ui/otp-field"
export * from "./components/ui/separator"
export * from "./components/ui/skeleton"
export * from "./components/ui/spinner"
export * from "./components/ui/textarea"

// icons
export * from "./components/icons"

// components
export * from "./components/composed/ai"
export * from "./components/composed/logo"
export * from "./components/composed/password-input"
export * from "./components/composed/social-providers"
export * from "./components/composed/reader"
export * from "./components/composed/tree"
export { default as User } from "./components/composed/user"
export type { IUserMessageProps, TUserInfoProps, TUserPillProps } from "./components/composed/user/types"
export * from "./components/composed/verse"
// The old `components/user-avatar` module was removed (92f029c); the avatar
// now lives in `components/atoms/avatar` and flows through the atoms barrel.

// blocks
export * from "./components/blocks/auth/auth-shell"
export * from "./components/blocks/auth/auth-flow-block"
export * from "./components/blocks/auth/auth-state"
export * from "./components/blocks/auth/code-auth-block"
export * from "./components/blocks/auth/forgot-password-block"
export * from "./components/blocks/auth/linked-accounts-block"
export * from "./components/blocks/auth/login-block"
export * from "./components/blocks/auth/onboarding-block"
export * from "./components/blocks/auth/passkey-manager-block"
export * from "./components/blocks/auth/passkey-sign-in-block"
export * from "./components/blocks/auth/signup-block"
export * from "./components/blocks/auth/update-password-block"
export * from "./components/blocks/sidebar"
export * from "./components/blocks/shell"
export { default as ShellLayout } from "./components/blocks/shell"
export * from "./components/blocks/scaffold"
export { default as Layout } from "./components/blocks/layout"
export * from "./components/blocks/profile"

// motion primitives
export * from "./components/motion/shared-layout-bg"

// state
export * from "./lib/state"

// The v0.17 sidebar monolith became the shell block's AnimatedPanel parts.
// `blocks/shell` above already exports every part under its new name; these
// aliases keep the published AnimatedSidebar* names working for consumers.
// `MobileSidebar` is intentionally absent — AnimatedPanel carries a TODO for
// the replacement mobile experience.
export {
  AnimatedPanel as AnimatedSidebar,
  AnimatedPanelProvider as AnimatedSidebarProvider,
  AnimatedPanelTrigger as AnimatedSidebarTrigger,
  AnimatedPanelInset as AnimatedSidebarInset,
} from "./components/blocks/shell"

// lib
export * from "./lib/auth-accent"
export * from "./lib/ease"
export * from "./lib/sound"
export * from "./lib/utils"

// chat (exegia-ui Sketch library)
export * from "./components/ui/chat"
export * from "./components/composed/chat"
export * from "./components/blocks/chat"
export * from "./lib/keyed-atom"

// Base UI primitives; names such as Avatar and Sidebar are scoped here.
export * as UI from "./ui"
