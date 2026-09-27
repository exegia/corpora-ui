"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useSetAtom } from "jotai"
import {
  bindCorpusNavigationAtom,
  removeCorpusNavigationInstance,
} from "./corpus-navigation-atom"
import {
  useCorpusNavigationActions,
  useCorpusNavigationState,
} from "./use-corpus-navigation-state"
import type { CorpusNavigationOptions } from "./types"

/** Mount once per navigator. Observers use the read/actions hooks instead. */
export function useCorpusNavigation(options: CorpusNavigationOptions) {
  const generatedId = useId()
  const navigatorId = options.navigatorId ?? generatedId
  const [seed] = useState(options.defaultLocation ?? null)
  const state = useCorpusNavigationState(navigatorId)
  const actions = useCorpusNavigationActions(navigatorId)
  const bind = useSetAtom(bindCorpusNavigationAtom(navigatorId))
  const { data, location, historyLimit = 20, onNavigate } = options
  // This hook never reads the data/config projection, avoiding inline-array loops.
  // Reads above subscribe before projection, matching the library's Jotai v3 pattern.
  useEffect(() => {
    bind({
      data,
      controlled: location !== undefined,
      location: location === undefined ? seed : location,
      historyLimit: Math.max(0, Math.floor(historyLimit)),
      onNavigate,
    })
  }, [bind, data, location, seed, historyLimit, onNavigate])
  const lifecycle = useRef(0)
  useEffect(() => {
    const generation = ++lifecycle.current
    if (options.navigatorId !== undefined) return
    return () => {
      actions.cancel()
      // StrictMode replays effects before this microtask; keep its live atoms.
      queueMicrotask(() => {
        if (lifecycle.current === generation)
          removeCorpusNavigationInstance(navigatorId)
      })
    }
  }, [options.navigatorId, navigatorId, actions])
  return { navigatorId, ...state, ...actions }
}
