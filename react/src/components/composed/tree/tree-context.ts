"use client"

import * as React from "react"

import type { ITreeContextValue } from "./type"

export const TreeContext = React.createContext<ITreeContextValue | null>(null)

export function useTreeContext(): ITreeContextValue {
  const context = React.useContext(TreeContext)
  if (!context) throw new Error("Tree rows must render inside <Tree>.")
  return context
}
