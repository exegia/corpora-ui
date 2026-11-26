/**
 * npm library entry point (`@corpora/ui`).
 *
 * Export every published component here — atoms from `components/ui`,
 * compositions from `components/composed`, blocks from `components/blocks`.
 * The docs site (main.tsx + routes.tsx + pages/) is NOT part of the package.
 */

// atoms
export * from "./components/atoms"
// Base UI primitives; names such as Avatar and Sidebar are scoped here.
export * from "./components/ui"

// icons
export * from "./components/icons"

// components
export * from "./components/composed"

// blocks
export * from "./components/blocks"

// motion primitives
export * from "./components/motion"

// lib
export * from "./lib/state"
export * from "./lib/auth-accent"
export * from "./lib/ease"
export * from "./lib/sound"
export * from "./lib/utils"
export * from "./lib/keyed-atom"
