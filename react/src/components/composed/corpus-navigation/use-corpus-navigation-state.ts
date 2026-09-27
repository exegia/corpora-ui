"use client"

import { useMemo } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import {
  cancelCorpusNavigationAtom,
  commitCorpusLocationAtom,
  corpusNavigationStateAtom,
  openCorpusPickerAtom,
  returnCorpusLocationAtom,
  searchCorpusAtom,
  selectCorpusLocationAtom,
  setCorpusCommandOpenAtom,
} from "./corpus-navigation-atom"
import type { CorpusNavigationActions } from "./types"

export function useCorpusNavigationState(id: string) {
  return useAtomValue(corpusNavigationStateAtom(id))
}
/** Writes only: callers do not subscribe to location, query or draft changes. */
export function useCorpusNavigationActions(
  id: string
): CorpusNavigationActions {
  const select = useSetAtom(selectCorpusLocationAtom(id))
  const openPicker = useSetAtom(openCorpusPickerAtom(id))
  const cancel = useSetAtom(cancelCorpusNavigationAtom(id))
  const setCommandOpen = useSetAtom(setCorpusCommandOpenAtom(id))
  const search = useSetAtom(searchCorpusAtom(id))
  const commit = useSetAtom(commitCorpusLocationAtom(id))
  const returnToPrevious = useSetAtom(returnCorpusLocationAtom(id))
  return useMemo(
    () => ({
      select,
      openPicker,
      cancel,
      setCommandOpen,
      search,
      commit,
      returnToPrevious,
    }),
    [
      select,
      openPicker,
      cancel,
      setCommandOpen,
      search,
      commit,
      returnToPrevious,
    ]
  )
}
