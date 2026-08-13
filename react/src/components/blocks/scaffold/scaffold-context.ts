"use client"

import * as React from "react"

import type { ScaffoldContextValue } from "./type"

export const ScaffoldContext = React.createContext<ScaffoldContextValue | null>(
  null
)

/** Read the scaffold's shared state; must run under `Scaffold.Root`. */
export function useScaffoldContext(): ScaffoldContextValue {
  const context = React.useContext(ScaffoldContext)
  if (!context) {
    throw new Error("useScaffoldContext must be used within <Scaffold.Root>")
  }
  return context
}
