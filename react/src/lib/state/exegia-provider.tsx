"use client"

/* eslint-disable react-refresh/only-export-components */
/**
 * The library's one and only state provider.
 *
 * Mount it once at the app root. Every library state hook then works
 * anywhere below it. Shell/Scaffold retain their local layout contexts;
 * overlay roots retain per-instance focus and open-state coordination.
 *
 * One Jotai provider supplies the library's module-level atoms and any
 * consumer atoms. Local UI contexts coordinate layout and focus without
 * replacing that store. No atom registration or additional app provider
 * is needed as features are added.
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
import { ToastProvider } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { activateProviderSounds } from "./sound-loading"
import { exegiaStore } from "./store"
import type { TExegiaStore } from "./store"
import { ExegiaPortalContext, type TExegiaPortalContainer } from "./portal-context"

/** Options forwarded to the library's `ThemeProvider`. */
export interface IExegiaThemeOptions {
  defaultTheme?: "dark" | "light" | "system"
  storageKey?: string
  disableTransitionOnChange?: boolean
}

export interface IExegiaProviderProps {
  children: React.ReactNode
  /** Store to mount. Defaults to the library's `exegiaStore`. */
  store?: TExegiaStore
  /** Default portal destination. Omit for body; null defers portal mounting. */
  portalContainer?: TExegiaPortalContainer
  /** Toasts are always available; configure their placement and manager here. */
  toast?: Omit<React.ComponentProps<typeof ToastProvider>, "children">
  /** Shared tooltip timing. The provider is always mounted. */
  tooltip?: Omit<React.ComponentProps<typeof TooltipProvider>, "children">
  /** Load and bind interaction sound on demand. Playback starts once loaded. */
  sound?: boolean
  /** Mount `ThemeProvider` with these options. Omit it and none is mounted —
   * it reads `localStorage` in its state initializer, so an unconditional
   * mount would break SSR consumers, and `useTheme` already throws without
   * one. */
  theme?: IExegiaThemeOptions
}

export function ExegiaProvider({
  children,
  store,
  portalContainer,
  toast,
  tooltip,
  sound = false,
  theme,
}: IExegiaProviderProps): React.ReactElement {
  React.useEffect(() => {
    if (sound) return activateProviderSounds()
  }, [sound])

  // Toasts ride on the same single mount: components call `toastManager.add`
  // and it renders here, so consumers never nest a second provider.
  const content = (
    <ExegiaPortalContext.Provider value={portalContainer}>
      <TooltipProvider {...tooltip}>
        <ToastProvider {...toast}>{children}</ToastProvider>
      </TooltipProvider>
    </ExegiaPortalContext.Provider>
  )
  return (
    <Provider store={store ?? exegiaStore}>
      {theme ? <ThemeProvider {...theme}>{content}</ThemeProvider> : content}
    </Provider>
  )
}

/** The store mounted by the nearest `ExegiaProvider` above the caller. */
export const useExegiaStore = useStore
