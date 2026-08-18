"use client"

/* eslint-disable react-refresh/only-export-components */
/**
 * The library's one and only state provider.
 *
 * Mount it once at the app root. Every library state hook then works
 * anywhere below it — there are no per-component providers to nest.
 *
 * One provider suffices because library state lives in module-level Jotai
 * atom families keyed by an instance id, not in a context created per
 * component. A new stateful component adds atoms to that module scope; it
 * never adds a provider. Consumer code therefore stays exactly as it is as
 * the library grows.
 *
 * Without this provider the hooks still run, which is the trap: Jotai falls
 * back to its implicit default store, and that store is NOT `exegiaStore`,
 * so imperative access would read a different store than the one the
 * components render from. Mount the provider.
 *
 * ```tsx
 * export function App() {
 *   return (
 *     <ExegiaProvider sound>
 *       <Routes />
 *     </ExegiaProvider>
 *   )
 * }
 * ```
 */
import * as React from "react"
import { Provider, useStore } from "jotai"

import { ThemeProvider } from "@/components/theme-provider"
import { bindSounds } from "@/lib/sound"
import { exegiaStore } from "./store"
import type { ExegiaStore } from "./store"

/** Options forwarded to the library's `ThemeProvider`. */
export interface ExegiaThemeOptions {
  defaultTheme?: "dark" | "light" | "system"
  storageKey?: string
  disableTransitionOnChange?: boolean
}

export interface ExegiaProviderProps {
  children: React.ReactNode
  /** Store to mount. Defaults to the library's `exegiaStore`. */
  store?: ExegiaStore
  /** Opt into interaction sound. Off unless the app asks for it. */
  sound?: boolean
  /** Mount `ThemeProvider` with these options. Omit it and none is mounted —
   * it reads `localStorage` in its state initializer, so an unconditional
   * mount would break SSR consumers, and `useTheme` already throws without
   * one. */
  theme?: ExegiaThemeOptions
}

export function ExegiaProvider({
  children,
  store,
  sound = false,
  theme,
}: ExegiaProviderProps): React.ReactElement {
  React.useEffect(() => {
    // Idempotent, and deliberately not at module scope: opting into sound is
    // the consuming app's decision, not an import side effect.
    if (sound) bindSounds()
  }, [sound])

  return (
    <Provider store={store ?? exegiaStore}>
      {theme ? <ThemeProvider {...theme}>{children}</ThemeProvider> : children}
    </Provider>
  )
}

/** The store mounted by the nearest `ExegiaProvider` above the caller. */
export const useExegiaStore = useStore
