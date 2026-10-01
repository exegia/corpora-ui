"use client"

import { useEffect, useRef } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import {
  projectCanonLinkAtom,
  removeCanonInstance,
  canonActiveSectionIdAtom,
  canonExpandedIdsAtom,
  canonSelectedLinkAtom,
  resetCanonAtom,
  selectCanonItemAtom,
  setCanonSectionAtom,
} from "./canon-atom"

/** Bind a named canonical navigator to the nearest ExegiaProvider store. */
export function useCanon(canonId: string) {
  const selectedLink = useAtomValue(canonSelectedLinkAtom(canonId))
  const expandedIds = useAtomValue(canonExpandedIdsAtom(canonId))
  const activeSectionId = useAtomValue(canonActiveSectionIdAtom(canonId))
  const select = useSetAtom(selectCanonItemAtom(canonId))
  const setSection = useSetAtom(setCanonSectionAtom(canonId))
  const reset = useSetAtom(resetCanonAtom(canonId))
  return {
    selectedLink,
    expandedIds,
    activeSectionId,
    select,
    setSection,
    reset,
  }
}

/** @internal Bind component props and release anonymous atom definitions. */
export function useCanonController(
  id: string,
  activeLink: string | undefined,
  anonymous: boolean
) {
  const state = useCanon(id)
  const projectLink = useSetAtom(projectCanonLinkAtom(id))
  useEffect(() => {
    projectLink(activeLink)
  }, [activeLink, projectLink])

  // Defer release so StrictMode's effect replay can reclaim the same atoms.
  const lifetime = useRef({ id, generation: 0 })
  useEffect(() => {
    const generation = lifetime.current.generation + 1
    lifetime.current = { id, generation }
    return () => {
      if (!anonymous) return
      queueMicrotask(() => {
        if (
          lifetime.current.id !== id ||
          lifetime.current.generation === generation
        ) {
          removeCanonInstance(id)
        }
      })
    }
  }, [id, anonymous])
  return state
}
