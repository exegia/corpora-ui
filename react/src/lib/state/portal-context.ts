"use client"

import { createContext, useContext, type RefObject } from "react"

export type TExegiaPortalContainer =
  | HTMLElement
  | ShadowRoot
  | RefObject<HTMLElement | ShadowRoot | null>
  | null
  | undefined

export const ExegiaPortalContext = createContext<TExegiaPortalContainer>(undefined)

/** Per-overlay containers win. Native Base UI null defers portal mounting. */
export function useExegiaPortalContainer(override?: TExegiaPortalContainer) {
  const inherited = useContext(ExegiaPortalContext)
  return override === undefined ? inherited : override
}
