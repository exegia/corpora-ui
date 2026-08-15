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
export * from "./components/blocks/nav/sidebar"
export * from "./components/blocks/shell"
export { default as ShellLayout } from "./components/blocks/shell"
export { default as Layout } from "./components/blocks/layout"
export * from "./components/blocks/profile/profile-card-block"

// motion primitives
export * from "./components/motion/animated-sidebar"
export * from "./components/motion/shared-layout-bg"

// lib
export * from "./lib/auth-accent"
export * from "./lib/ease"
export * from "./lib/sound"
export * from "./lib/utils"
export { MobileSidebar } from "@/components/motion/mobile-sidebar.tsx"
export { AnimatedSidebarProvider } from "@/components/motion/animated-panel-provider.tsx"
export { AnimatedSidebarTrigger } from "@/components/motion/animated-panel-trigger.tsx"
export { AnimatedSidebarInset } from "@/components/motion/animated-panel-inset.tsx"
export { AnimatedSidebarContent } from "@/components/motion/animated-sidebar-content.tsx"
export { AnimatedSidebarFooter } from "@/components/motion/animated-sidebar-footer.tsx"
export { AnimatedSidebarGroup } from "@/components/motion/animated-sidebar-group.tsx"
export { AnimatedSidebarGroupLabel } from "@/components/motion/animated-sidebar-group-label.tsx"
export { AnimatedSidebarGroupContent } from "@/components/motion/animated-sidebar-group-content.tsx"
export { AnimatedSidebarMenu } from "@/components/motion/animated-sidebar-menu.tsx"
export { AnimatedSidebarMenuItem } from "@/components/motion/animated-sidebar-menu-item.tsx"
export { AnimatedSidebarMenuSub } from "@/components/motion/animated-sidebar-menu-sub.tsx"
export { AnimatedSidebarMenuSubItem } from "@/components/motion/animated-sidebar-menu-sub-item.tsx"
export { AnimatedSidebarMenuSubButton } from "@/components/motion/animated-sidebar-menu-sub-button.tsx"
export { AnimatedSidebarMenuButton } from "@/components/motion/animated-sidebar-menu-button.tsx"
