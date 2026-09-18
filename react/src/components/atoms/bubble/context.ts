"use client"

import { createContext, useContext } from "react"
import type { TBubbleVariant } from "./types"

export const BubbleContext = createContext<TBubbleVariant>("recipient")

/** Variant of the closest `Bubble` ancestor; used by the sub-components. */
export function useBubbleVariant(): TBubbleVariant {
  return useContext(BubbleContext)
}
