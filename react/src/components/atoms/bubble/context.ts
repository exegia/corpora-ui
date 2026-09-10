"use client"

import { createContext, useContext } from "react"
import type { BubbleVariant } from "./types"

export const BubbleContext = createContext<BubbleVariant>("recipient")

/** Variant of the closest `Bubble` ancestor; used by the sub-components. */
export function useBubbleVariant(): BubbleVariant {
  return useContext(BubbleContext)
}
