"use client"

import * as React from "react"
import { useAtomValue, useSetAtom } from "jotai"

import {
  profileCardStateAtom,
  resetProfileCardAtom,
  setProfileCardMenuOpenAtom,
  setProfileCardVariantAtom,
  toggleProfileCardVariantAtom,
} from "./profile-card-atom"
import type {
  ProfileCardActions,
  ProfileCardInstanceId,
  ProfileCardState,
} from "./type"

/**
 * Read the card registered under `profileCardId` from anywhere below
 * `ExegiaProvider` — no props, no ref, no provider of its own.
 *
 * ```tsx
 * const { variant, busy } = useProfileCardState("account")
 * ```
 *
 * Returns the whole state object, so the caller re-renders on any change. A
 * component that watches one field should subscribe to that atom instead:
 * `useAtomValue(profileCardVariantAtom("account"))`.
 */
export function useProfileCardState(
  profileCardId: ProfileCardInstanceId
): ProfileCardState {
  return useAtomValue(profileCardStateAtom(profileCardId))
}

/**
 * Write-only handles onto the card registered under `profileCardId`. Nothing
 * here subscribes, so a rail toggle can fold the card without re-rendering
 * when the card changes.
 *
 * ```tsx
 * const { collapse, expand } = useProfileCardActions("account")
 * ```
 */
export function useProfileCardActions(
  profileCardId: ProfileCardInstanceId
): ProfileCardActions {
  const setVariant = useSetAtom(setProfileCardVariantAtom(profileCardId))
  const toggleVariant = useSetAtom(toggleProfileCardVariantAtom(profileCardId))
  const setMenuOpen = useSetAtom(setProfileCardMenuOpenAtom(profileCardId))
  const reset = useSetAtom(resetProfileCardAtom(profileCardId))

  return React.useMemo(
    () => ({
      setVariant,
      toggleVariant,
      collapse: () => setVariant("collapsed"),
      expand: () => setVariant("expanded"),
      setMenuOpen,
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
      reset,
    }),
    [setVariant, toggleVariant, setMenuOpen, reset]
  )
}
