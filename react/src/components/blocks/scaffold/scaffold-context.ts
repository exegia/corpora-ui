"use client"

import * as React from "react"

import type { ScaffoldContextValue } from "./type"

export const ScaffoldContext = React.createContext<ScaffoldContextValue | null>(
  null
)

/** Read the scaffold's identity (`scaffoldId`, `inspectorWidth`); must run
 * under `Scaffold.Root`. State itself lives in the store — subscribe to the
 * atoms, or reach them by id through `useScaffoldState` / `useScaffoldActions`. */
export function useScaffoldContext(): ScaffoldContextValue {
  const context = React.useContext(ScaffoldContext)
  if (!context) {
    throw new Error("useScaffoldContext must be used within <Scaffold.Root>")
  }
  return context
}
