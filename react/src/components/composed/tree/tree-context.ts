"use client"

import * as React from "react"

import type { TreeContextValue } from "./type"

export const TreeContext = React.createContext<TreeContextValue | null>(null)

export function useTreeContext(): TreeContextValue {
  const context = React.useContext(TreeContext)
  if (!context) throw new Error("Tree rows must render inside <Tree>.")
  return context
}
